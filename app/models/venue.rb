class Venue < ActiveRecord::Base

  validates :label, :venue_type, presence: true
  validates :label, uniqueness: true

  has_many :bookings

end
