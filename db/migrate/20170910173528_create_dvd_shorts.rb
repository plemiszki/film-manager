class CreateDvdShorts < ActiveRecord::Migration[5.2]
  def change
    create_table :dvd_shorts do |t|
      t.integer :dvd_id, null: false
      t.integer :short_id, null: false
    end

    add_index :dvd_shorts, [:dvd_id, :short_id], unique: true
  end
end
