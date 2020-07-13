class CreateCreditMemos < ActiveRecord::Migration[5.2]
  def change
    create_table :credit_memos do |t|
      t.date :sent_date, null: false
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
      t.decimal :total, precision: 8, scale: 2, default: 0
      t.string :return_number, null: false
      t.integer :customer_id, null: false
    end

    add_index :credit_memos, :customer_id

    add_column :settings, :next_credit_memo_number, :integer, default: 1
    add_column :settings, :credit_memo_email_text, :string, default: ''

    create_table :credit_memo_rows do |t|
      t.integer :credit_memo_id, null: false
      t.string :item_label, null: false
      t.decimal :unit_price, precision: 8, scale: 2, default: 0
      t.integer :item_qty, null: false
      t.decimal :total_price, precision: 8, scale: 2, default: 0
      t.integer :dvd_id, null: false
    end
  end
end
