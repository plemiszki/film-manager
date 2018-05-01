class CreateInTheatersFilms < ActiveRecord::Migration
  def change
    create_table :in_theaters_films do |t|
      t.integer :film_id, null: false
      t.boolean :coming_soon, default: false
      t.integer :order, null: false
    end
  end
end
