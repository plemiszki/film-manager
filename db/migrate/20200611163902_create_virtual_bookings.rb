class CreateVirtualBookings < ActiveRecord::Migration[5.2]
  def change
    create_table :virtual_bookings do |t|
      t.integer :film_id, null: false
      t.integer :venue_id, null: false
      t.date :date_added, null: false
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.string :shipping_city, default: ''
      t.string :shipping_state, default: ''
      t.string :terms, default: ''
      t.string :url, default: ''
    end
  end
end
