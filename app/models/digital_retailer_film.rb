class DigitalRetailerFilm < ActiveRecord::Base

  validates :film_id, :digital_retailer_id, :url, presence: true
  validates :digital_retailer_id, uniqueness: { scope: :film_id }

  belongs_to :film
  belongs_to :digital_retailer

end
