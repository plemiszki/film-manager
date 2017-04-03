class RoyaltyRevenueStream < ActiveRecord::Base

  validates :royalty_report_id, :revenue_stream_id, presence: true
  validates :royalty_report_id, uniqueness: { scope: :revenue_stream_id }

end
