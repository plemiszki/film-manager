class CreateQuotes < ActiveRecord::Migration
  def change
    create_table :quotes do |t|
      t.integer :film_id, null: false
      t.string :text, null: false
      t.string :author
      t.string :publication
    end
    create_table :laurels do |t|
      t.integer :film_id, null: false
      t.string :result, null: false
      t.string :award_name
      t.string :festival, null: false
    end
    create_table :related_films do |t|
      t.integer :film_id, null: false
      t.integer :other_film_id, null: false
    end
  end
end
