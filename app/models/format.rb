class Format < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :bookings
  has_many :film_formats, dependent: :destroy

end
