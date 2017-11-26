class InvoiceRow < ActiveRecord::Base

  validates :invoice_id, :item_label, :item_qty, null: false

  belongs_to :invoice

end
