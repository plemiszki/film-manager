class InstitutionOrderFormat < ActiveRecord::Base

  validates :format_id, :institution_order_id, presence: true
  validates :format_id, uniqueness: { scope: :institution_order_id }

  belongs_to :format

  belongs_to :institution_order
  alias_attribute :order, :institution_order

end
