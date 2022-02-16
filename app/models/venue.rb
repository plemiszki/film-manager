class Venue < ActiveRecord::Base

  validates :label, :venue_type, presence: true
  validates :label, uniqueness: true

  has_many :bookings
  has_many :virtual_bookings

  def self.trim_labels!
    Venue.all.each do |venue|
      venue.update(label: venue.label.strip)
    end
  end

end
