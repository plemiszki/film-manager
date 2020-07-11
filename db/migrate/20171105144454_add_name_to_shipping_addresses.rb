class AddNameToShippingAddresses < ActiveRecord::Migration[5.2]
  def change
    add_column :shipping_addresses, :name, :string
  end
end
