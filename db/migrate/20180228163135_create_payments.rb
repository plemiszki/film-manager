class CreatePayments < ActiveRecord::Migration[5.2]
  def change
    create_table :payments do |t|
      t.integer :booking_id
      t.decimal :amount, :decimal, precision: 8, scale: 2, default: 0.0
      t.date :date
      t.string :notes
    end
  end
end
