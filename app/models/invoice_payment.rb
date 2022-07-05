class InvoicePayment < ActiveRecord::Base

  include DateFieldYearsConverter
  before_validation :convert_date_field_years

  validates :payment_id, :invoice_id, presence: true
  validates :date, date: true

  belongs_to :invoice
  belongs_to :payment

end
