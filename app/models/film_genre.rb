class FilmGenre < ActiveRecord::Base

  validates :film_id, :genre_id, presence: true

  belongs_to :genre
  belongs_to :film, touch: true

end
