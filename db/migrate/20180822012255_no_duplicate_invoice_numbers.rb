class NoDuplicateInvoiceNumbers < ActiveRecord::Migration
  def change
    add_index :invoices, :number, unique: true
  end
end
