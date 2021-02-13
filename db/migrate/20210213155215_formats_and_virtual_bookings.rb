class FormatsAndVirtualBookings < ActiveRecord::Migration[5.2]
  def change
    add_column :formats, :active, :boolean, default: true
    add_column :virtual_bookings, :host, :integer, default: 0
  end
end
