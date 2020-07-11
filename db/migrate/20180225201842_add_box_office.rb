class AddBoxOffice < ActiveRecord::Migration[5.2]
  def change
    add_column :bookings, :box_office, :decimal, precision: 8, scale: 2, default: 0.0
  end
end
