class RoyaltyRevenueStream < ActiveRecord::Base

  validates :royalty_report_id, :revenue_stream_id, presence: true
  validates :royalty_report_id, uniqueness: { scope: :revenue_stream_id }
  validates_numericality_of :licensor_percentage, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100
  validates_numericality_of :current_revenue
  validates_numericality_of :current_expense
  validates_numericality_of :cume_revenue
  validates_numericality_of :cume_expense

  belongs_to :revenue_stream
  belongs_to :royalty_report

end
