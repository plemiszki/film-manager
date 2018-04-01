class AddFormats < ActiveRecord::Migration
  def change
    create_table :formats do |t|
      t.string :name, null: false
    end
    add_column :bookings, :format_id, :integer, default: 1
    add_index :formats, :name, unique: true
    add_index :bookings, :format_id
    add_index :bookings, :old_booker_id
    add_index :bookings, :old_user_id
  end
end
