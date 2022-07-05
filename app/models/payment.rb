class Payment < ActiveRecord::Base

  include DateFieldYearsConverter
  before_validation :convert_date_field_years

  validates :booking_id, presence: true
  validates_numericality_of :amount
  validates :date, date: true

  belongs_to :booking, polymorphic: true

end
