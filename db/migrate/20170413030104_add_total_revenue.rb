class AddTotalRevenue < ActiveRecord::Migration
  def change
    add_column :royalty_reports, :current_total_revenue, :decimal, precision: 8, scale: 2, default: 0
    add_column :royalty_reports, :cume_total_revenue, :decimal, precision: 8, scale: 2, default: 0
    change_column :royalty_reports, :current_total_expenses, :decimal, :precision => 8, :scale => 2
    change_column :royalty_reports, :cume_total_expenses, :decimal, :precision => 8, :scale => 2
    change_column :royalty_reports, :current_total, :decimal, :precision => 8, :scale => 2
  end
end
