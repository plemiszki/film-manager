class AddStuffToDvdCustomers < ActiveRecord::Migration
  def change
    add_column :dvd_customers, :sage_id, :string, default: ""
    add_column :dvd_customers, :invoices_email, :string, default: ""
  end
end
