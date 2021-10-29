class EduPlatformFilm < ActiveRecord::Base

  validates :film_id, :edu_platform_id, :url, presence: true
  validates :edu_platform_id, uniqueness: { scope: :film_id }

  belongs_to :film
  belongs_to :edu_platform

end
