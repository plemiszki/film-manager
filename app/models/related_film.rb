class RelatedFilm < ActiveRecord::Base

  validates :film_id, :other_film_id, presence: true

  belongs_to :film, touch: true
  belongs_to :other_film, class_name: "Film", foreign_key: :other_film_id, touch: true

end
