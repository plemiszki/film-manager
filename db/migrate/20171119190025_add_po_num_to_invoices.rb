class AddPoNumToInvoices < ActiveRecord::Migration[5.2]
  def change
    add_column :invoices, :po_number, :string
  end
end
