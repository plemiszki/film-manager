class CreateCountries < ActiveRecord::Migration
  def change
    create_table :countries do |t|
      t.string :text, null: false
    end
    create_table :languages do |t|
      t.string :text, null: false
    end
    create_table :genres do |t|
      t.string :text, null: false
    end
    create_table :topics do |t|
      t.string :text, null: false
    end
    create_table :film_countries do |t|
      t.integer :film_id, null: false
      t.integer :country_id, null: false
    end
    create_table :film_languages do |t|
      t.integer :film_id, null: false
      t.integer :language_id, null: false
    end
    create_table :film_genres do |t|
      t.integer :film_id, null: false
      t.integer :genre_id, null: false
    end
    create_table :film_topics do |t|
      t.integer :film_id, null: false
      t.integer :topic_id, null: false
    end
  end
end
