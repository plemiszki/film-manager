class NewVirtualFields < ActiveRecord::Migration[6.1]
  def change
    add_column :virtual_bookings, :deduction, :decimal, precision: 8, scale: 2, default: "0.0"
    add_column :virtual_bookings, :box_office, :decimal, precision: 8, scale: 2, default: "0.0"
  end
end
