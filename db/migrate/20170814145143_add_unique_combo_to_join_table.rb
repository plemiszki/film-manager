class AddUniqueComboToJoinTable < ActiveRecord::Migration[5.2]
  def change
    add_index :giftbox_films, [:giftbox_id, :film_id], unique: true
  end
end
