class CreateWeeklyBoxOffices < ActiveRecord::Migration
  def change
    create_table :weekly_box_offices do |t|
      t.integer :order, null: false
      t.integer :booking_id, null: false
      t.decimal :amount, precision: 8, scale: 2, default: 0.0
    end

    add_index :weekly_box_offices, :booking_id
  end
end
