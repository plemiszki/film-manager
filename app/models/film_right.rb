class FilmRight < ActiveRecord::Base

  validates :film_id, :right_id, :territory_id, presence: true
  validates :film_id, uniqueness: { scope: [:right_id, :territory_id] }
  validates_date :start_date, :end_date, allow_blank: false

  belongs_to :film
  belongs_to :right
  belongs_to :territory

end
