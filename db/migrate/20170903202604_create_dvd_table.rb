class CreateDvdTable < ActiveRecord::Migration[5.2]
  def change
    create_table :dvds do |t|
      t.integer :dvd_type_id, null: false
      t.integer :feature_film_id, null: false
      t.integer :short_film_id
      t.integer :short_film_2_id
      t.decimal :price, precision: 5, scale: 2
      t.string :upc
      t.integer :stock
      t.boolean :repressing
      t.string :sound_config
      t.string :special_features
      t.integer :discs
      t.integer :units_shipped
      t.date :first_shipment
    end

    add_index :dvds, :dvd_type_id
    add_index :dvds, :feature_film_id
    add_index :dvds, :short_film_id
    add_index :dvds, :short_film_2_id
  end
end
