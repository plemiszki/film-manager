class ExpandPayments < ActiveRecord::Migration[6.1]
  def change
    add_column :payments, :booking_type, :string, default: "Booking"
  end
end
