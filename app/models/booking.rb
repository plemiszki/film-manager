class Booking < ActiveRecord::Base

  include DateFieldYearsConverter
  before_validation :convert_date_field_years

  validates :film_id, :venue_id, :booking_type, :status, :format_id, presence: true
  validates_numericality_of :advance, :shipping_fee, :house_expense, :deduction, :box_office, :greater_than_or_equal_to => 0
  validates :date_added, :start_date, :end_date, date: true
  validates :materials_sent, :imported_advance_invoice_sent, :imported_overage_invoice_sent, :booking_confirmation_sent, date: { blank_ok: true }
  validate :booker_id_or_old_booker_id
  validate :end_date_not_before_start_date

  belongs_to :film
  belongs_to :venue
  belongs_to :format
  belongs_to :past_booker, foreign_key: :old_booker_id
  belongs_to :past_user, class_name: "PastBooker", foreign_key: :old_user_id

  has_many :weekly_terms, -> { order(:order) }
  has_many :weekly_box_offices, -> { order(:order) }
  has_many :payments, as: :booking, dependent: :destroy
  has_many :invoices, dependent: :destroy

  scope :payment_reminders, -> {
    includes(:film, :venue)
    .left_outer_joins(:payments)
    .where("bookings.booking_type in ('Non-Theatrical', 'Festival')")
    .where("bookings.start_date < ?", Date.today + 4.weeks)
    .where("bookings.start_date > ?", Date.today)
    .group("bookings.id")
    .having("count(payments) = 0")
  }

  def booker_id_or_old_booker_id
    unless booker_id || old_booker_id
      errors.add(:booker_id, "can't be blank")
    end
  end

  def theatrical?
    booking_type == 'Theatrical'
  end

  def needs_box_office_reminder
    case booking_type
    when "Theatrical"
      return true
    when "Festival"
      return terms.match(/^\$[\d\.]+ vs [\d\.]+%$/) || terms.match(/^[\d\.]+%$/)
    else
      return false
    end
  end

  def info
    venue = self.venue
    venue_name = (venue.billing_name.present? ? venue.billing_name : venue.label)
    "#{self.film.title} at #{venue_name} (#{self.start_date.strftime("%-m/%-d/%y")})"
  end

  def self.send_payment_reminders(force: false)
    return unless force || Time.now.in_time_zone("America/New_York").strftime("%A") == "Monday"
    sender = Setting.first.payment_reminders_sender
    Booking.payment_reminders.each do |booking|
      booking.send_payment_reminder(sender: sender)
    end
  end

  def send_payment_reminder(sender: nil)
    sender = sender || Setting.first.payment_reminders_sender

    email_body = <<~COPY
    Hello,

    This is an automated request to remind you that we have not received payment for this booking. Per company policy, we will not deliver film assets until payment has been processed.  Please send to my attention as soon as possible.

    Our bank details are as follows for ACH or wire transfers:
    Bank: Citibank NA
    SWIFT: CITI US 33
    Routing Number: 021000089
    Account Number: 4985552536
    Wire or transfer fees are the responsibility of the payer.

    We accept checks sent to 505 8th Ave., Ste. 1102, New York, NY 10018.

    To pay invoices totaling $500 or less via credit card, call us at 212.941.7744 and choose extension 3.

    Kind Regards,

    #{sender.name}
    Film Movement

    COPY

    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']

    if ENV['TEST_MODE'] == 'true'
      message_params = {
        to: ENV['TEST_MODE_EMAIL'],
      }
    else
      message_params = {
        to: self.email,
        bcc: [sender.email, ENV['TEST_MODE_EMAIL']],
      }
    end

    message_params = message_params.merge({
      from: sender.email,
      subject: "Payment Reminder: #{self.info}",
      text: email_body,
    })
    mg_client.send_message 'filmmovement.com', message_params
  end

  def self.send_box_office_reminders
    return unless Time.now.in_time_zone("America/New_York").strftime("%A") == "Friday"
    sender = Setting.first.box_office_reminders_sender

    email_body = <<~COPY
    Hello,

    This is an automated request to remind you that we have not received the box office report for this booking. Please send the report to my attention by end of day.

    Kind Regards,

    #{sender.name}
    Film Movement

    COPY

    theatrical_bookings = Booking.where(booking_type: "Theatrical", status: "Confirmed", box_office_received: false, box_office: 0, terms_change: false)
    .where("end_date < ?", Date.today - 4.weeks)
    .where("end_date > ?", Date.today - 6.months)
    .order(:start_date)

    bookings_with_missing_weekly_box_office = []
    Booking.where(booking_type: "Theatrical", status: "Confirmed", box_office_received: false, terms_change: true).includes(:weekly_box_offices).each do |booking|
      bookings_with_missing_weekly_box_office << booking if booking.weekly_box_offices.length == 0
    end

    theatrical_bookings += bookings_with_missing_weekly_box_office

    festival_bookings = Booking.where(booking_type: "Festival", status: "Confirmed", box_office_received: false, box_office: 0)
    .where("end_date < ?", Date.today - 4.weeks)
    .where("end_date > ?", Date.today - 6.months)
    .order(:start_date).select do |booking|
      booking.needs_box_office_reminder
    end

    all_bookings = theatrical_bookings + festival_bookings
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
    all_bookings.each_with_index do |booking, index|
      next if booking.terms.match(/^\$[\d\.]+$/) # don't need box office for flat fee bookings
      venue = booking.venue
      venue_name = (venue.billing_name.present? ? venue.billing_name : venue.label)
      message_params = {
        from: sender.email,
        to: booking.email,
        bcc: sender.email,
        subject: "Box Office Reminder: #{booking.film.title} at #{venue_name} (#{booking.start_date.strftime("%-m/%-d/%y")})",
        text: email_body
      }
      mg_client.send_message 'filmmovement.com', message_params
    end
  end

end
