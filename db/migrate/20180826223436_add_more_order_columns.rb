class AddMoreOrderColumns < ActiveRecord::Migration[5.2]
  def change
    add_column :film_languages, :order, :integer
    add_column :film_countries, :order, :integer
    add_column :film_genres, :order, :integer
    add_column :actors, :order, :integer
  end
end
