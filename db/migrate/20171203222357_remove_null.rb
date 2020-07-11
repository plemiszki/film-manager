class RemoveNull < ActiveRecord::Migration[5.2]
  def change
    change_column_null :purchase_orders, :source_doc, true
  end
end
