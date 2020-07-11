class AddStuffToPos < ActiveRecord::Migration[5.2]
  def change
    add_column :purchase_orders, :name, :string, default: ""
    add_column :purchase_orders, :country, :string, default: ""
  end
end
