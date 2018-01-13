class Venue < ActiveRecord::Base

  validates :label, :sage_id, :venue_type, presence: true
  validates :label, :sage_id, uniqueness: true

end
