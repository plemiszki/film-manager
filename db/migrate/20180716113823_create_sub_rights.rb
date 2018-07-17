class CreateSubRights < ActiveRecord::Migration
  def change
    create_table :sub_rights do |t|
      t.integer :right_id, null: false
      t.integer :sublicensor_id, null: false
      t.integer :territory_id, null: false
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.boolean :exclusive, default: false
    end

    add_index :sub_rights, :right_id
    add_index :sub_rights, :sublicensor_id
    add_index :sub_rights, :territory_id
  end
end
