class BookingsRemoveColumnDatePaid < ActiveRecord::Migration[6.1]
  def change
    remove_column :bookings, :date_paid
  end
end
