class NoDuplicateInvoiceNumbers < ActiveRecord::Migration[5.2]
  def change
    add_index :invoices, :number, unique: true
  end
end
