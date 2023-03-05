class FilmFormat < ActiveRecord::Base

  validates :film_id, :format_id, presence: true

  belongs_to :format
  belongs_to :film, touch: true

end
