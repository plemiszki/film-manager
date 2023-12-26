class Institution < ActiveRecord::Base

  has_many :institution_orders, dependent: :destroy
  alias_attribute :orders, :institution_orders

  validates :label, presence: true
  validates :label, uniqueness: true

end
