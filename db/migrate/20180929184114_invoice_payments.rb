class InvoicePayments < ActiveRecord::Migration[5.2]
  def change
    create_table :invoice_payments do |t|
      t.integer :invoice_id, null: false
      t.integer :payment_id, null: false
      t.decimal :amount, precision: 8, scale: 2, default: 0.0
      t.string :notes, default: ""
      t.date :date, null: false
    end
  end
end
