class CreateBookings < ActiveRecord::Migration
  def change
    create_table :bookings do |t|
      t.integer :film_id, null: false
      t.integer :venue_id, null: false
      t.date :date_added, null: false
      t.string :booking_type, null: false
      t.string :status, null: false
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.string :terms, null: false
      t.boolean :terms_change, default: false
      t.decimal :advance, precision: 5, scale: 2, default: 0.0
      t.decimal :shipping_fee, precision: 5, scale: 2, default: 0.0
      t.integer :screenings, default: 1
      t.integer :booker_id, null: false
      t.integer :user_id, null: false
      t.string :billing_name, default: ""
      t.string :billing_address1, default: ""
      t.string :billing_address2, default: ""
      t.string :billing_city, default: ""
      t.string :billing_state, default: ""
      t.string :billing_zip, default: "", default: ""
      t.string :billing_country, default: ""
      t.string :shipping_name, default: ""
      t.string :shipping_address1, default: ""
      t.string :shipping_address2, default: ""
      t.string :shipping_city, default: ""
      t.string :shipping_state, default: ""
      t.string :shipping_zip, default: ""
      t.string :shipping_country, default: ""
      t.string :format, default: ""
      t.string :email, default: ""
      t.integer :advance_invoice_id
      t.date :advance_invoice_sent
      t.date :booking_confirmation_sent
      t.integer :overage_invoice_id
      t.date :overage_invoice_sent
      t.string :premiere, default: ""
      t.date :materials_sent
      t.boolean :no_materials, default: false
      t.string :shipping_notes, default: ""
      t.string :tracking_number, default: ""
      t.boolean :delivered, default: false
      t.date :date_paid
      t.decimal :house_expense, precision: 5, scale: 2, default: 0.0
      t.string :notes, default: ""
      t.decimal :deduction, precision: 5, scale: 2, default: 0.0
    end

    add_index :bookings, :film_id
    add_index :bookings, :venue_id
    add_index :bookings, :advance_invoice_id
    add_index :bookings, :overage_invoice_id
    add_index :bookings, :user_id
    add_index :bookings, :booker_id
  end
end
