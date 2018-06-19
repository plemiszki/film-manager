class DigitalRetailerFilm < ActiveRecord::Base

  validates :film_id, :digital_retailer_id, presence: true

end
