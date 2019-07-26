class Booking < ActiveRecord::Base

  validates :film_id, :venue_id, :booking_type, :status, :date_added, :start_date, :end_date, presence: true
  validates_numericality_of :advance, :shipping_fee, :house_expense, :deduction, :box_office, :greater_than_or_equal_to => 0
  validates_date :date_added, :start_date, :end_date
  validates_date :materials_sent, :imported_advance_invoice_sent, :imported_overage_invoice_sent, :booking_confirmation_sent, allow_blank: true

  validate :booker_id_or_old_booker_id

  belongs_to :film
  belongs_to :venue
  belongs_to :format
  belongs_to :past_booker, foreign_key: :old_booker_id
  belongs_to :past_user, class_name: "PastBooker", foreign_key: :old_user_id

  has_many :weekly_terms, -> { order(:order) }
  has_many :weekly_box_offices, -> { order(:order) }
  has_many :payments, dependent: :destroy
  has_many :invoices, dependent: :destroy

  def booker_id_or_old_booker_id
    unless booker_id || old_booker_id
      errors.add(:base, "Booker is mandatory")
    end
  end

  def needs_reminder
    case booking_type
    when "Theatrical"
      return true
    when "Festival"
      return terms.match(/^\$[\d\.]+ vs [\d\.]+%$/) || terms.match(/^[\d\.]+%$/)
    else
      return false
    end
  end

  def self.send_box_office_reminders(name:, email:)
    return unless Time.now.in_time_zone("America/New_York").strftime("%A") == "Friday"

email_body = <<-COPY
Hello,

This is an automated request to remind you that we have not received the box office report for this booking. Please send the report to my attention by end of day.

Kind Regards,

#{name}
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
      booking.needs_reminder
    end

    all_bookings = theatrical_bookings + festival_bookings
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
    all_bookings.each_with_index do |booking, index|
      venue = booking.venue
      venue_name = (venue.billing_name.present? ? venue.billing_name : venue.label)
      message_params = {
        from: email,
        to: 'plemiszki@gmail.com',
        # bcc: 'plemiszki@gmail.com',
        subject: "Box Office Reminder: #{booking.film.title} at #{venue_name} (#{booking.start_date.strftime("%-m/%-d/%y")})",
        text: email_body
      }
      mg_client.send_message 'filmmovement.com', message_params
    end
  end

end
