class CreatePurchaseOrders < ActiveRecord::Migration
  def change
    create_table :purchase_orders do |t|
      t.string :number, null: false
      t.integer :customer_id, default: 0
      t.string :address1, default: ""
      t.string :address2, default: ""
      t.string :city, default: ""
      t.string :state, default: ""
      t.string :zip, default: ""
    end

    create_table :purchase_order_dvds do |t|
      t.integer :purchase_order_id, null: false
      t.integer :dvd_id, null: false
    end
  end
end
