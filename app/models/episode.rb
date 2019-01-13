class Episode < ActiveRecord::Base

  validates :title, :film_id, presence: true
  validates_numericality_of :episode_number, :season_number, :length, :greater_than_or_equal_to => 1
  validates :episode_number, uniqueness: { scope: [:film_id, :season_number] }

  belongs_to :film

end
