class AmazonLanguage < ActiveRecord::Base

  validates :name, :code, presence: true

  has_many :amazon_language_films, dependent: :destroy

end
