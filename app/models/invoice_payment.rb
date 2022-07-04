class InvoicePayment < ActiveRecord::Base

  validates :payment_id, :invoice_id, presence: true
  validates :date, date: true

  belongs_to :invoice
  belongs_to :payment

end
