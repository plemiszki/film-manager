class AddNullConstraintToPoMonth < ActiveRecord::Migration
  def change
    change_column_null :purchase_orders, :month, false
  end
end
