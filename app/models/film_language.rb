class FilmLanguage < ActiveRecord::Base

  validates :film_id, :language_id, presence: true

  belongs_to :language
  belongs_to :film

end
