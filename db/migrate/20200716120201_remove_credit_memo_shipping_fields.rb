class RemoveCreditMemoShippingFields < ActiveRecord::Migration[5.2]
  def change
    remove_column :credit_memos, :shipping_name
    remove_column :credit_memos, :shipping_address1
    remove_column :credit_memos, :shipping_address2
    remove_column :credit_memos, :shipping_city
    remove_column :credit_memos, :shipping_state
    remove_column :credit_memos, :shipping_zip
    remove_column :credit_memos, :shipping_country
  end
end
