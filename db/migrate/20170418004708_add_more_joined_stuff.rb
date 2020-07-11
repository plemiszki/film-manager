class AddMoreJoinedStuff < ActiveRecord::Migration[5.2]
  def change
    add_column :royalty_revenue_streams, :joined_total_revenue, :decimal, precision: 8, scale: 2, default: 0
    add_column :royalty_revenue_streams, :joined_total_expenses, :decimal, precision: 8, scale: 2, default: 0
    add_column :royalty_revenue_streams, :joined_total, :decimal, precision: 8, scale: 2, default: 0
  end
end
