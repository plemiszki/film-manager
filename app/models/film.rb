class Film < ActiveRecord::Base

  validates :title, :label_id, presence: true
  validates :title, uniqueness: { scope: :short_film }
  validate :gr_percentage_tenth_decimal
  validates_numericality_of :mg, :greater_than_or_equal_to => 0
  validates_numericality_of :expense_cap, :greater_than_or_equal_to => 0
  validates_numericality_of :e_and_o, :greater_than_or_equal_to => 0
  validates_numericality_of :reserve_percentage, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100
  validates_numericality_of :reserve_quarters, :greater_than_or_equal_to => 0
  validates_numericality_of :reserve_start_year, :greater_than_or_equal_to => 2000
  validates_numericality_of :reserve_start_quarter, :greater_than_or_equal_to => 1, :less_than_or_equal_to => 4

  def gr_percentage_tenth_decimal
    if [5, 6].include?(deal_type_id)
      validates_numericality_of :gr_percentage, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100
    end
  end

  belongs_to :licensor
  has_many :film_revenue_percentages, dependent: :destroy
  has_many :film_rights, dependent: :destroy
  has_many :royalty_reports, dependent: :destroy

  after_create :create_percentages

  def create_percentages
    unless short_film
      RevenueStream.all.each do |revenue_stream|
        FilmRevenuePercentage.create!(film_id: id, revenue_stream_id: revenue_stream.id)
      end
    end
  end

end
