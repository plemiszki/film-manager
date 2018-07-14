class Country < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :film_countries, dependent: :destroy

end
