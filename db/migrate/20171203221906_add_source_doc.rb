class AddSourceDoc < ActiveRecord::Migration[5.2]
  def change
    add_column :purchase_orders, :source_doc, :string
    change_column :purchase_orders, :source_doc, :string, null: false
  end
end
