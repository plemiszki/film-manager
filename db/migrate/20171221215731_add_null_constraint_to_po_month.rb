class AddNullConstraintToPoMonth < ActiveRecord::Migration[5.2]
  def change
    change_column_null :purchase_orders, :month, false
  end
end
