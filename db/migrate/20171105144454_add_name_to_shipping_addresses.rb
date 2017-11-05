class AddNameToShippingAddresses < ActiveRecord::Migration
  def change
    add_column :shipping_addresses, :name, :string
  end
end
