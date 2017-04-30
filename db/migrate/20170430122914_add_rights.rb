class AddRights < ActiveRecord::Migration
  def change
    create_table :rights do |t|
      t.string :name, null: false
      t.integer :order, null: false
    end

    create_table :film_rights do |t|
      t.integer :film_id, null: false
      t.integer :right_id, null: false
      t.boolean :value, default: false
    end

    add_index :film_rights, [:film_id, :right_id], unique: true
  end
end
