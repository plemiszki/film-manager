class RoyaltyReport < ActiveRecord::Base

  validates :film_id, :quarter, :year, presence: true
  validates :film_id, uniqueness: { scope: [:quarter, :year] }

  has_many :royalty_revenue_streams

end
