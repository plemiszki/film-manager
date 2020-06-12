class VirtualBookingsNeedUrl < ActiveRecord::Migration[5.2]
  def change
    change_column_null :virtual_bookings, :url, false
  end
end
