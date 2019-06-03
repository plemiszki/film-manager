class AddDigitalRetailerFields < ActiveRecord::Migration
  def change
    add_column :digital_retailers, :billing_name, :string, default: ""
    add_column :digital_retailers, :billing_address1, :string, default: ""
    add_column :digital_retailers, :billing_address2, :string, default: ""
    add_column :digital_retailers, :billing_city, :string, default: ""
    add_column :digital_retailers, :billing_state, :string, default: ""
    add_column :digital_retailers, :billing_zip, :string, default: ""
    add_column :digital_retailers, :billing_country, :string, default: ""
  end
end
