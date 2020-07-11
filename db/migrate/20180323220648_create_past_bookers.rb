class CreatePastBookers < ActiveRecord::Migration[5.2]
  def change
    create_table :past_bookers do |t|
      t.string :name, null: false
    end
    add_column :bookings, :old_booker_id, :integer
    add_column :bookings, :old_user_id, :integer
    change_column_null :bookings, :booker_id, true
    change_column_null :bookings, :user_id, true
  end
end
