class WeeklyBoxOffice < ActiveRecord::Base

  validates :booking_id, :amount, :order, presence: true
  validates_numericality_of :amount, allow_blank: false

  belongs_to :booking

end
