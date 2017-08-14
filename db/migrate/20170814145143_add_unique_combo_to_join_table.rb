class AddUniqueComboToJoinTable < ActiveRecord::Migration
  def change
    add_index :giftbox_films, [:giftbox_id, :film_id], unique: true
  end
end
