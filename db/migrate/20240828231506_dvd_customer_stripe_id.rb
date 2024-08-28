class DvdCustomerStripeId < ActiveRecord::Migration[7.0]
  def change
    add_column :dvd_customers, :stripe_id, :string, default: ""
    add_index :dvd_customers, :stripe_id, unique: true, where: "stripe_id != ''"
  end
end
