class DvdCustomer < ActiveRecord::Base

  validates :name, presence: true
  validates :name, uniqueness: true
  validates_numericality_of :discount, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100
  validates :invoices_email, :sage_id, :payment_terms, presence: true, if: :not_consignment

  def not_consignment
    !self.consignment
  end

end
