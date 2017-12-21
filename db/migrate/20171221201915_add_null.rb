class AddNull < ActiveRecord::Migration
  def change
    change_column_null :purchase_orders, :year, false
  end
end
