class User < ActiveRecord::Base

  include Clearance::User

  enum(:access, { user: 50, admin: 100, super_admin: 150 })

  validates :name, presence: true

  has_many :bookings, foreign_key: :booker_id
  has_many :entered_bookings, class_name: "Booking"

  scope :bookers, -> { where(booker: true) }
  scope :active_bookers, -> { where(booker: true, inactive: false) }
  scope :box_office_reminder_senders, -> { where(booker: true, inactive: false).where.not(name: 'Producer') }

  def send_test_email!
    SendEmail.new(
      sender: self,
      recipients: ENV.fetch("TEST_MODE_EMAIL"),
      subject: "test",
      body: "This is test!",
      email_type: 'test',
    ).call
  end

end
