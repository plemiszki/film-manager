class PoOrderDateNullFalse < ActiveRecord::Migration[5.2]
  def change
    change_column_null :purchase_orders, :order_date, :false
  end
end
