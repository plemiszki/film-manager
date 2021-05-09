class InvoiceRow < ActiveRecord::Base

  validates :invoice_id, :item_label, :item_qty, presence: true

  belongs_to :invoice

end
