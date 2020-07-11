class RemoveAddressFromDvdCustoemrs < ActiveRecord::Migration[5.2]
  def change
    remove_column :dvd_customers, :address
  end
end
