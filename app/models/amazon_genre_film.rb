class AmazonGenreFilm < ActiveRecord::Base

  validates :film_id, :amazon_genre_id, presence: true

  belongs_to :film
  belongs_to :amazon_genre

end
