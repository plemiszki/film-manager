class User < ActiveRecord::Base

  include Clearance::User

  validates :name, presence: true

  has_many :bookings, foreign_key: :booker_id
  has_many :entered_bookings, class_name: "Booking"

end
