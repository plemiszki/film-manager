class AddFilmRevenuePercentages < ActiveRecord::Migration[5.2]
  def change
    create_table :film_revenue_percentages do |t|
      t.integer :film_id, null: false
      t.integer :revenue_stream_id, null: false
      t.decimal :value, precision: 5, scale: 2, default: 0
    end

    add_index :film_revenue_percentages, :film_id
    add_index :film_revenue_percentages, :revenue_stream_id
  end
end
