class RemoveShipFeeFromInvoices < ActiveRecord::Migration
  def change
    remove_column :invoices, :ship_fee
  end
end
