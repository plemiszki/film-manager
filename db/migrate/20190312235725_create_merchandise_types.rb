class CreateMerchandiseTypes < ActiveRecord::Migration[5.2]
  def change
    create_table :merchandise_types do |t|
      t.string :name, null: false
    end
    add_index :merchandise_types, :name, unique: true

    create_table :merchandise_items do |t|
      t.integer :merchandise_type_id, null: false
      t.string :name, null: false
      t.string :size, default: ""
      t.decimal :price, precision: 5, scale: 2, default: 0.0
      t.integer :inventory, default: 0
      t.text :description, default: ""
      t.integer :film_id
    end
    add_index :merchandise_items, [:name, :merchandise_type_id], unique: true
  end
end
