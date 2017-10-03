class SwapFilmForDvd < ActiveRecord::Migration
  def change
    drop_table :giftbox_films
    create_table :giftbox_dvds do |t|
      t.integer :dvd_id, null: false
      t.integer :giftbox_id, null: false
    end
    add_index :giftbox_dvds, [:dvd_id, :giftbox_id], unique: true
  end
end
