class SubRight < ActiveRecord::Base

  validates :sublicensor_id, :right_id, :territory_id, :film_id, presence: true
  validates :sublicensor_id, uniqueness: { scope: [:right_id, :territory_id, :film_id, :exclusive] }
  validates_date :start_date, :end_date, allow_blank: false

  belongs_to :sublicensor
  belongs_to :right
  belongs_to :territory
  belongs_to :film

  scope :expired, -> { where('end_date <= CURRENT_DATE') }
  scope :days_until_expired, -> (days) { where("end_date > CURRENT_DATE and end_date <= (CURRENT_DATE + #{days})") }

  def sent_reminders_within(duration)
    start_date_of_window = self.end_date - duration
    expiration_reminders.select { |sent_date| sent_date >= start_date_of_window }
  end

  def self.send_expiration_reminders!
    two_month_sub_rights = SubRight.get_expiring_rights_with_unsent_reminders(days: 60)
    if two_month_sub_rights.present?
      email_body = SubRight.add_to_email_body(timeframe: 'two', rights: two_month_sub_rights)
      mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
      message_params = {
        from: 'demetri@filmmovement.com',
        to: (ENV['TEST_MODE'] == 'true' ? ENV['TEST_MODE_EMAIL'] : 'demetri@filmmovement.com'),
        bcc: 'plemiszki@gmail.com',
        subject: "Expiration Reminders",
        text: email_body
      }
      mg_client.send_message 'filmmovement.com', message_params
      two_month_sub_rights.each do |sub_right|
        sub_right.expiration_reminders << Date.today
        sub_right.save!
      end
    end
  end

  def self.get_expiring_rights_with_unsent_reminders(days:)
    SubRight.days_until_expired(days).includes(:film, :territory, :right, :sublicensor).select { |sub_right| sub_right.sent_reminders_within(days.days).empty? }
  end

  def self.add_to_email_body(timeframe:, rights:)
    lines = []
    rights.each do |right|
      lines << "#{right.sublicensor.name} - #{right.film.title} - #{right.right.name} - #{right.territory.name} - (#{right.end_date.strftime("%D")})"
    end
    result = "The following sublicensed rights will expire in #{timeframe} months:\n\n"
    result += lines.sort.join("\n")
    result += "\n"
    result
  end

end
