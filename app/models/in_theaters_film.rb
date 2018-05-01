class InTheatersFilm < ActiveRecord::Base

  validates :film_id, :order, presence: true

  belongs_to :film

end
