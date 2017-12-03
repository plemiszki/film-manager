class AddSourceDoc < ActiveRecord::Migration
  def change
    add_column :purchase_orders, :source_doc, :string
    change_column :purchase_orders, :source_doc, :string, null: false
  end
end
