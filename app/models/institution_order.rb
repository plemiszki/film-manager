class InstitutionOrder < ActiveRecord::Base

  belongs_to :institution
  alias_attribute :customer, :institution

  validates :institution_id, :order_date, presence: true
  validates :number, uniqueness: { scope: :institution_id }

end
