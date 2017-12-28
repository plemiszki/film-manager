class Return < ActiveRecord::Base

  validates :number, :date, :customer_id, presence: true

  belongs_to(
    :customer,
    class_name: "DvdCustomer",
    foreign_key: :customer_id
  )

end
