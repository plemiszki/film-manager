class Payment < ActiveRecord::Base

  validates :booking_id, :date, presence: true
  validates_numericality_of :amount
  validates_date :date, allow_blank: false

  belongs_to :booking

end
