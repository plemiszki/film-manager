class CreateReturns < ActiveRecord::Migration
  def change
    create_table :returns do |t|
      t.string :number, null: false
      t.date :date, null: false
      t.integer :customer_id, null: false
    end

    add_index :returns, :customer_id

    create_table :return_items do |t|
      t.integer :return_id, null: false
      t.string :item_type, null: false
      t.integer :item_id, null: false
      t.integer :order, null: false
      t.integer :qty, null: false
    end

    add_index :return_items, :return_id
    add_index :return_items, :item_id
  end
end
