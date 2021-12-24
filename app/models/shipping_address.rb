class ShippingAddress < ActiveRecord::Base

  belongs_to :dvd_customer, foreign_key: :customer_id
  alias_attribute :customer, :dvd_customer

  validates :label, presence: true, uniqueness: true

end
