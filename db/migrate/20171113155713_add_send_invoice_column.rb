class AddSendInvoiceColumn < ActiveRecord::Migration
  def change
    add_column :purchase_orders, :send_invoice, :boolean, default: true 
  end
end
