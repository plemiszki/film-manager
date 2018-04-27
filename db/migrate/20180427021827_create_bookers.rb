class CreateBookers < ActiveRecord::Migration
  def change
    create_table :bookers do |t|
      t.string :name, null: false
      t.string :email
      t.string :phone
    end

    create_table :booker_venues do |t|
      t.integer :booker_id, null: false
      t.integer :venue_id, null: false
    end
  end
end
