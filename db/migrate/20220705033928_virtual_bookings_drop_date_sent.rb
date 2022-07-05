class VirtualBookingsDropDateSent < ActiveRecord::Migration[6.1]
  def change
    remove_column :virtual_bookings, :report_sent
  end
end
