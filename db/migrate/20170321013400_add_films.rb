class AddFilms < ActiveRecord::Migration[5.2]
  def change
    create_table :labels do |t|
      t.string :name, null: false
    end
    create_table :films do |t|
      t.string :title, null: false
      t.boolean :short_film, default: false
      t.integer :feature_id
      t.integer :label_id, null: false
      t.integer :licensor_id
      t.integer :deal_type_id, default: 1
      t.integer :days_statement_due, null: false
      t.integer :gr_percentage
      t.integer :mg, default: 0
      t.integer :e_and_o, default: 0
      t.integer :expense_cap
      t.string :sage_id, default: ""
      t.string :royalty_notes, default: ""
    end
    add_index :films, :feature_id
    add_index :films, :label_id
    add_index :films, :licensor_id
    add_index :films, :deal_type_id
  end
end
