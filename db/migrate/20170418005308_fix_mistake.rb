class FixMistake < ActiveRecord::Migration
  def change
    remove_column :royalty_revenue_streams, :joined_total_revenue
    remove_column :royalty_revenue_streams, :joined_total_expenses
    remove_column :royalty_revenue_streams, :joined_total
    remove_column :royalty_revenue_streams, :joined_amount_due
    add_column :royalty_reports, :joined_total_revenue, :decimal, precision: 8, scale: 2, default: 0
    add_column :royalty_reports, :joined_total_expenses, :decimal, precision: 8, scale: 2, default: 0
    add_column :royalty_reports, :joined_total, :decimal, precision: 8, scale: 2, default: 0
    add_column :royalty_reports, :joined_amount_due, :decimal, precision: 8, scale: 2, default: 0
  end
end
