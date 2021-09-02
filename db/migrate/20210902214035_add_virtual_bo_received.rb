class AddVirtualBoReceived < ActiveRecord::Migration[6.1]
  def change
    add_column :virtual_bookings, :box_office_received, :boolean, default: false
  end
end
