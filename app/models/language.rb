class Language < ActiveRecord::Base

  validates :name, presence: true

  has_many :film_languages, dependent: :destroy

end
