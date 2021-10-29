class EduPlatform < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :edu_platform_films, dependent: :destroy

end
