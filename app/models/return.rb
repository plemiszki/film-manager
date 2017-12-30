class Return < ActiveRecord::Base

  validates :number, :date, :customer_id, presence: true
  validates_date :date, allow_blank: false

  has_many :return_items, dependent: :destroy
  has_many :items, through: :return_items
  belongs_to(
    :customer,
    class_name: "DvdCustomer",
    foreign_key: :customer_id
  )

end
