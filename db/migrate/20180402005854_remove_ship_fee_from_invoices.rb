class RemoveShipFeeFromInvoices < ActiveRecord::Migration[5.2]
  def change
    remove_column :invoices, :ship_fee
  end
end
