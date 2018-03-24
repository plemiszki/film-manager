class UpdateBookingsPrecision < ActiveRecord::Migration
  def change
    change_column :bookings, :advance, :decimal, precision: 8, scale: 2, default: 0.0
    change_column :bookings, :house_expense, :decimal, precision: 8, scale: 2, default: 0.0
    change_column :bookings, :deduction, :decimal, precision: 8, scale: 2, default: 0.0
  end
end
