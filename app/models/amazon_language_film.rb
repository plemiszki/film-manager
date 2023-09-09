class AmazonLanguageFilm < ActiveRecord::Base

  validates :film_id, :amazon_language_id, presence: true

  belongs_to :film
  belongs_to :amazon_language

end
