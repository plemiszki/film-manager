class CreatePurchaseOrderDvds < ActiveRecord::Migration
  def change
    add_column :purchase_order_dvds, :order, :integer
    change_column_null :purchase_order_dvds, :order, false
    add_index :purchase_order_dvds, [:dvd_id, :purchase_order_id], unique: true
  end
end
