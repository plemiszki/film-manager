class AddBillingAddressToDvdCustomers < ActiveRecord::Migration[5.2]
  def change
    add_column :dvd_customers, :billing_name, :string
    add_column :dvd_customers, :address1, :string
    add_column :dvd_customers, :address2, :string
    add_column :dvd_customers, :city, :string
    add_column :dvd_customers, :state, :string
    add_column :dvd_customers, :zip, :string
    add_column :dvd_customers, :country, :string
  end
end
