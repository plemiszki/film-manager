class BookingStripeColumns < ActiveRecord::Migration[7.0]
  def change
    remove_column :bookings, :stripe_customer_id
    add_column :bookings, :stripe_id, :string, default: ""
    add_column :bookings, :use_stripe, :boolean, default: false
  end
end
