class AddGiftboxJoinTable < ActiveRecord::Migration
  def change
    create_table :giftbox_films do |t|
      t.integer :giftbox_id, null: false
      t.integer :film_id, null: false
    end

    add_index :giftbox_films, :film_id
    add_index :giftbox_films, :giftbox_id
  end
end
