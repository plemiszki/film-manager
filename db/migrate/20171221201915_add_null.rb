class AddNull < ActiveRecord::Migration[5.2]
  def change
    change_column_null :purchase_orders, :year, false
  end
end
