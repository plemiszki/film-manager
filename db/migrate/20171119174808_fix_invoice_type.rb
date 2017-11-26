class FixInvoiceType < ActiveRecord::Migration
  def change
    rename_column :invoices, :type, :invoice_type
  end
end
