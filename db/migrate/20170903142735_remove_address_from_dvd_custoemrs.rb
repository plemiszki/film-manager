class RemoveAddressFromDvdCustoemrs < ActiveRecord::Migration
  def change
    remove_column :dvd_customers, :address
  end
end
