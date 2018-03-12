class Genre < ActiveRecord::Base

  validates :name, presence: true

  has_many :film_genres, dependent: :destroy

end
