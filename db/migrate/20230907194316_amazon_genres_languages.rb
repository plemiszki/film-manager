class AmazonGenresLanguages < ActiveRecord::Migration[7.0]
  def change
    create_table :amazon_languages do |t|
      t.string :name, null: false
      t.timestamps
    end

    create_table :amazon_genres do |t|
      t.string :name, null: false
      t.timestamps
    end

    create_table :amazon_language_films do |t|
      t.integer :film_id, null: false
      t.integer :amazon_language_id, null: false
      t.timestamps
    end

    create_table :amazon_genre_films do |t|
      t.integer :film_id, null: false
      t.integer :amazon_genre_id, null: false
      t.timestamps
    end

    add_index :amazon_languages, :name, unique: true
    add_index :amazon_genres, :name, unique: true

    add_index :amazon_language_films, [:film_id, :amazon_language_id], unique: true
    add_index :amazon_genre_films, [:film_id, :amazon_genre_id], unique: true
  end
end
