class RoyaltyReport < ActiveRecord::Base

  validates :film_id, :quarter, :year, presence: true
  validates :film_id, uniqueness: { scope: [:quarter, :year] }
  validates_numericality_of :current_total_expenses, :greater_than_or_equal_to => 0
  validates_numericality_of :cume_total_expenses, :greater_than_or_equal_to => 0
  validates_numericality_of :mg, :greater_than_or_equal_to => 0
  validates_numericality_of :e_and_o, :greater_than_or_equal_to => 0
  validates_numericality_of :amount_paid, :greater_than_or_equal_to => 0

  belongs_to :film
  has_many :royalty_revenue_streams, dependent: :destroy

end
