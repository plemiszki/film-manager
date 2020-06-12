class VirtualBooking < ActiveRecord::Base

  validates :film_id, :venue_id, :date_added, :start_date, :end_date, presence: true
  validates_date :date_added, :start_date, :end_date

  belongs_to :film
  belongs_to :venue

end
