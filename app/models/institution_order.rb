class InstitutionOrder < ActiveRecord::Base

  include DateFieldYearsConverter

  belongs_to :institution
  alias_attribute :customer, :institution

  before_validation :convert_date_field_years

  validates :institution_id, presence: true
  validates :order_date, date: true
  validates :number, uniqueness: { scope: :institution_id }

end
