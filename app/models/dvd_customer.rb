class DvdCustomer < ActiveRecord::Base

  include StripeHelpers

  validates :name, :billing_name, :address1, :city, :state, :zip, :country, presence: true
  validates :name, uniqueness: true
  validates_numericality_of :discount, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100, allow_blank: true
  validates :invoices_email, :sage_id, :payment_terms, presence: true, if: :not_consignment
  validates :consignment, :inclusion => {:in => [true, false]}

  def not_consignment
    !self.consignment
  end

  def get_name
    self.nickname.presence || self.name
  end

  def get_first_invoices_email
    emails = self.invoices_email.split(",")
    emails.present? ? emails[0].strip : nil
  end

  def create_stripe_customer!
    Stripe::Customer.create(email: self.get_first_invoices_email)
  end

  def get_stripe_id
    StripeHelpers.fetch_stripe_id(self.get_first_invoices_email)
  end

end
