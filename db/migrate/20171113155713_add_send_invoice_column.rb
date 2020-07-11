class AddSendInvoiceColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :purchase_orders, :send_invoice, :boolean, default: true 
  end
end
