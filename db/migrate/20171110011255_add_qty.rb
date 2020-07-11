class AddQty < ActiveRecord::Migration[5.2]
  def change
    add_column :purchase_order_dvds, :qty, :integer, default: 0
  end
end
