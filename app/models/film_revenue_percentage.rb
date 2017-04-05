class FilmRevenuePercentage < ActiveRecord::Base

  belongs_to :film

  validates :film_id, :revenue_stream_id, presence: true
  validates :film_id, uniqueness: { scope: :revenue_stream_id }

end
