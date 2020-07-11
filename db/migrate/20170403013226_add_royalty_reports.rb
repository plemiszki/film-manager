class AddRoyaltyReports < ActiveRecord::Migration[5.2]
  def change
    create_table :royalty_reports do |t|
      t.integer :film_id, null: false
      t.integer :year, null: false
      t.integer :quarter, null: false
      t.decimal :total, precision: 8, scale: 2, default: 0
      t.decimal :mg, precision: 8, scale: 2, default: 0
      t.decimal :e_and_o, precision: 8, scale: 2, default: 0
      t.decimal :amount_paid, precision: 8, scale: 2, default: 0
      t.decimal :amount_due, precision: 8, scale: 2, default: 0
    end

    create_table :revenue_stream do |t|
      t.string :name
    end

    create_table :royalty_revenue_stream do |t|
      t.integer :royalty_report_id, null: false
      t.integer :revenue_stream_id, null: false
      t.decimal :current_revenue, precision: 8, scale: 2, default: 0
      t.decimal :current_gr, precision: 8, scale: 2, default: 0
      t.decimal :current_expense, precision: 8, scale: 2, default: 0
      t.decimal :current_difference, precision: 8, scale: 2, default: 0
      t.decimal :current_licensor_share, precision: 8, scale: 2, default: 0
      t.decimal :cume_revenue, precision: 8, scale: 2, default: 0
      t.decimal :cume_gr, precision: 8, scale: 2, default: 0
      t.decimal :cume_expense, precision: 8, scale: 2, default: 0
      t.decimal :cume_difference, precision: 8, scale: 2, default: 0
      t.decimal :cume_licensor_share, precision: 8, scale: 2, default: 0
    end
  end
end
