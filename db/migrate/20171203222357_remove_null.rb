class RemoveNull < ActiveRecord::Migration
  def change
    change_column_null :purchase_orders, :source_doc, true
  end
end
