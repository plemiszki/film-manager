class FilmCountry < ActiveRecord::Base

  validates :film_id, :country_id, presence: true

  belongs_to :country
  belongs_to :film

end
