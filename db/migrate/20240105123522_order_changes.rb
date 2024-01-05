class OrderChanges < ActiveRecord::Migration[7.0]
  def change
    remove_column :institution_orders, :delivered
    add_column :institution_orders, :price, :decimal, precision: 5, scale: 2, default: 0
    add_column :institution_orders, :licensed_rights, :integer, default: 0
  end
end
