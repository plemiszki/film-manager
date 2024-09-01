class DvdCustomerStripeToggleEtc < ActiveRecord::Migration[7.0]
  def change
    add_column :dvd_customers, :use_stripe, :boolean, default: false
    add_column :invoices, :stripe_id, :string, default: ""
  end
end
