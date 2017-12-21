class PoOrderDateNullFalse < ActiveRecord::Migration
  def change
    change_column_null :purchase_orders, :order_date, :false
  end
end
