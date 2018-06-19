class CreateDigitalRetailers < ActiveRecord::Migration
  def change
    create_table :digital_retailers do |t|
      t.string :name, null: false
    end

    create_table :digital_retailer_films do |t|
      t.integer :digital_retailer_id, null: false
      t.integer :film_id, null: false
      t.string :url, default: ""
    end
  end
end
