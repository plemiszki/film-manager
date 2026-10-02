class AmazonGenre < ActiveRecord::Base

  validates :code, presence: true

  has_many :amazon_genre_films, dependent: :destroy

end
