module StripeHelpers

  extend ActiveSupport::Concern

  def self.fetch_stripe_id(email_address)
    results = Stripe::Customer.search({query: "email:'#{email_address}'"}).data
    if results.present?
      results.first.id
    else
      ""
    end
  end

end
