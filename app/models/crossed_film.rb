class CrossedFilm < ActiveRecord::Base

  validates :film_id, :crossed_film_id, presence: true
  validates :film_id, uniqueness: { scope: :crossed_film_id }

  belongs_to :film
  belongs_to(
    :crossed_film,
    class_name: 'Film',
    foreign_key: :crossed_film_id
  )

end
