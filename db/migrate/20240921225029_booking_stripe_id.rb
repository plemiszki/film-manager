class BookingStripeId < ActiveRecord::Migration[7.0]
  def change
    add_column :bookings, :stripe_customer_id, :string, default: ""
  end
end
