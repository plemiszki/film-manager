class VbBillingAddress < ActiveRecord::Migration[6.1]
  def change
    add_column :virtual_bookings, :billing_name, :string, default: ''
    add_column :virtual_bookings, :billing_address1, :string, default: ''
    add_column :virtual_bookings, :billing_address2, :string, default: ''
    add_column :virtual_bookings, :billing_city, :string, default: ''
    add_column :virtual_bookings, :billing_state, :string, default: ''
    add_column :virtual_bookings, :billing_zip, :string, default: ''
    add_column :virtual_bookings, :billing_country, :string, default: ''
  end
end
