class BookerVenue < ActiveRecord::Base

  validates :booker_id, :venue_id, presence: true

  belongs_to :booker
  belongs_to :venue

end
