class FilmRevenuePercentage < ActiveRecord::Base

  belongs_to :film
  belongs_to :revenue_stream

  validates :film_id, :revenue_stream_id, presence: true
  validates :film_id, uniqueness: { scope: :revenue_stream_id }
  validates_numericality_of :value, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100

end
