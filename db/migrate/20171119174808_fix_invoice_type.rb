class FixInvoiceType < ActiveRecord::Migration[5.2]
  def change
    rename_column :invoices, :type, :invoice_type
  end
end
