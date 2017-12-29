class Return < ActiveRecord::Base

  validates :number, :date, :customer_id, presence: true
  validates_date :date, allow_blank: false

  belongs_to(
    :customer,
    class_name: "DvdCustomer",
    foreign_key: :customer_id
  )

end
