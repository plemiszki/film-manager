class RelatedFilm < ActiveRecord::Base

  validates :film_id, :other_film_id, presence: true

  belongs_to :film

end
