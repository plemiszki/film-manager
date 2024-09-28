class RemoveStripeIdColumns < ActiveRecord::Migration[7.0]
  def change
    remove_column :venues, :stripe_id
    remove_column :bookings, :stripe_id
    remove_column :dvd_customers, :stripe_id
    remove_column :institutions, :stripe_id
  end
end
