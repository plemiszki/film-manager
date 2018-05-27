class FilmRight < ActiveRecord::Base

  validates :film_id, :right_id, presence: true
  validates :film_id, uniqueness: { scope: [:right_id, :territory_id] }

  belongs_to :film
  belongs_to :right

end
