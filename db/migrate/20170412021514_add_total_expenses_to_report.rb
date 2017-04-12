class AddTotalExpensesToReport < ActiveRecord::Migration
  def change
    add_column :royalty_reports, :current_total_expenses, :decimal, precision: 5, scale: 2, default: 0
    add_column :royalty_reports, :cume_total_expenses, :decimal, precision: 5, scale: 2, default: 0
    add_column :royalty_reports, :current_total, :decimal, precision: 5, scale: 2, default: 0
    rename_column :royalty_reports, :total, :cume_total 
  end
end
