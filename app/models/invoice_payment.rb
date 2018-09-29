class InvoicePayment < ActiveRecord::Base

  validates :payment_id, :invoice_id, presence: true
  validates_date :date

  belongs_to :invoice
  belongs_to :payment

end
