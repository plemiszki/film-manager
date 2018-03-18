class CreateDirectorsAndActors < ActiveRecord::Migration
  def change
    create_table :directors do |t|
      t.integer :film_id, null: false
      t.string :first_name
      t.string :last_name, null: false
    end
    add_index :directors, :film_id
    create_table :actors do |t|
      t.integer :film_id, null: false
      t.string :first_name
      t.string :last_name, null: false
    end
    add_index :actors, :film_id
  end
end
