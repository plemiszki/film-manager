class Institution < ActiveRecord::Base

  has_many :institution_orders, dependent: :destroy
  alias_attribute :orders, :institution_orders

  validates :label, presence: true
  validates :label, uniqueness: true

  def create_stripe_customer!
    Stripe::Customer.create(email: self.email)
  end

  def get_stripe_id
    StripeHelpers.fetch_stripe_id(self.email)
  end

end
