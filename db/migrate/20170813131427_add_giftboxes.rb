class AddGiftboxes < ActiveRecord::Migration[5.2]
  def change
    create_table :giftboxes do |t|
      t.string :name, null: false
      t.string :upc, null: false
      t.decimal :msrp, precision: 5, scale: 2, default: 0.0
      t.boolean :on_demand, default: false
      t.integer :quantity, default: 0
      t.string :sage_id, default: ""
    end
  end
end
