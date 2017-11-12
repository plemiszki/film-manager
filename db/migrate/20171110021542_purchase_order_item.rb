class PurchaseOrderItem < ActiveRecord::Migration
  def change
    drop_table :purchase_order_dvds
    create_table :purchase_order_items do |t|
      t.integer :purchase_order_id, null: false
      t.string :item_type, null: false
      t.integer :item_id, null: false
      t.integer :order, null: false
      t.integer :qty,  default: 0
    end
  end
end
