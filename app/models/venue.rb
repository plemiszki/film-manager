class Venue < ActiveRecord::Base

  include StripeHelpers

  validates :label, :venue_type, presence: true
  validates :label, uniqueness: true

  has_many :bookings
  has_many :virtual_bookings

  def self.trim_labels!
    Venue.all.each do |venue|
      venue.update(label: venue.label.strip)
    end
  end

  def create_stripe_customer!
    Stripe::Customer.create(email: self.email)
  end

  def get_stripe_id
    StripeHelpers.fetch_stripe_id(self.email)
  end

end
