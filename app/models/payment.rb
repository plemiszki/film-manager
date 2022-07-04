class Payment < ActiveRecord::Base

  validates :booking_id, presence: true
  validates_numericality_of :amount
  validates_date :date

  belongs_to :booking, polymorphic: true

end
