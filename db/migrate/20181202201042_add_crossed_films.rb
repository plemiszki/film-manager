class AddCrossedFilms < ActiveRecord::Migration
  def change
    create_table :crossed_films do |t|
      t.integer :film_id, null: false
      t.integer :crossed_film_id, null: false
    end

    add_index :crossed_films, [:film_id, :crossed_film_id], unique: true
  end
end
