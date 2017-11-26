class CreateInvoices < ActiveRecord::Migration
  def change
    create_table :invoices do |t|
      t.string :type, null: false
      t.date :sent_date
      t.string :number, null: false
      t.string :billing_name, default: ''
      t.string :billing_address1, default: ''
      t.string :billing_address2, default: ''
      t.string :billing_city, default: ''
      t.string :billing_state, default: ''
      t.string :billing_zip, default: ''
      t.string :billing_country, default: ''
      t.string :shipping_name, default: ''
      t.string :shipping_address1, default: ''
      t.string :shipping_address2, default: ''
      t.string :shipping_city, default: ''
      t.string :shipping_state, default: ''
      t.string :shipping_zip, default: ''
      t.string :shipping_country, default: ''
      t.decimal :sub_total, precision: 8, scale: 2, default: 0.0
      t.decimal :ship_fee, precision: 8, scale: 2, default: 0.0
      t.decimal :total, precision: 8, scale: 2, default: 0.0
    end

    create_table :invoice_rows do |t|
      t.integer :invoice_id, null: false
      t.string :item_label, null: false
      t.decimal :unit_price, precision: 8, scale: 2, default: 0.0
      t.integer :item_qty, null: false
      t.decimal :total_price, precision: 8, scale: 2, default: 0.0
    end
  end
end
