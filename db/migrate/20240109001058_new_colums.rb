class NewColums < ActiveRecord::Migration[7.0]
  def change
    add_column :settings, :institution_order_invoice_email_text, :string, default: ""
    add_column :settings, :next_institution_invoice_number, :integer, default: 1
    add_column :invoices, :institution_order_id, :integer
    add_column :invoices, :institution_id, :integer
  end
end
