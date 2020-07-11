class AddPoInvoiceNotes < ActiveRecord::Migration[5.2]
  def change
    add_column :purchase_orders, :notes, :string, default: ""
    add_column :invoices, :notes, :string, default: ""
  end
end
