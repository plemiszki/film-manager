class CreateInstitutionOrders < ActiveRecord::Migration[7.0]
  def change
    create_table :institution_orders do |t|
      t.integer :institution_id, null: false
      t.date :order_date, null: false
      t.string :number, default: ""

      t.string :billing_name, default: ""
      t.string :billing_address_1, default: ""
      t.string :billing_address_2, default: ""
      t.string :billing_city, default: ""
      t.string :billing_state, default: ""
      t.string :billing_zip, default: ""
      t.string :billing_country, default: ""

      t.string :shipping_name, default: ""
      t.string :shipping_address_1, default: ""
      t.string :shipping_address_2, default: ""
      t.string :shipping_city, default: ""
      t.string :shipping_state, default: ""
      t.string :shipping_zip, default: ""
      t.string :shipping_country, default: ""

      t.decimal :shipping_fee, precision: 5, scale: 2, default: "0.0"
      t.boolean :materials_sent, default: false
      t.string :tracking_number, default: ""
      t.boolean :delivered, default: false
      t.string :notes, default: ""

      t.timestamps
    end

    add_index :institution_orders, [:institution_id, :number], unique: true
  end
end
