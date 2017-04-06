class RoyaltyReport < ActiveRecord::Base

  validates :film_id, :quarter, :year, presence: true
  validates :film_id, uniqueness: { scope: [:quarter, :year] }

end