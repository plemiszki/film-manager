class AddPoColumns < ActiveRecord::Migration
  def change
    add_column :purchase_orders, :order_date, :date
    add_column :purchase_orders, :ship_date, :date
  end
end
