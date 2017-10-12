class PurchaseOrder < ActiveRecord::Base

  validates :number, presence: true, uniqueness: true
  validates_date :order_date, :ship_date, allow_blank: true

  has_many :purchase_order_dvds
  has_many :dvds, through: :purchase_order_dvds
  belongs_to(
    :customer,
    class_name: "DvdCustomer",
    foreign_key: :customer_id,
    primary_key: :id
  )

end
