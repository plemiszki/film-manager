class CreateAliases < ActiveRecord::Migration[5.2]
  def change
    create_table :aliases do |t|
      t.integer :film_id, null: false
      t.string :text, null: false
    end

    add_index :aliases, [:film_id, :text], unique: true
  end
end
