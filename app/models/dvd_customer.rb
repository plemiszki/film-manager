class DvdCustomer < ActiveRecord::Base

  validates :name, :billing_name, :address1, :city, :state, :zip, :country, presence: true
  validates :name, uniqueness: true
  validates_numericality_of :discount, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100, allow_blank: true
  validates :invoices_email, :sage_id, :payment_terms, presence: true, if: :not_consignment
  validates :consignment, :inclusion => {:in => [true, false]}

  def not_consignment
    !self.consignment
  end

end
