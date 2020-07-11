class AddReserveStuffToReports < ActiveRecord::Migration[5.2]
  def change
    add_column :royalty_reports, :current_reserve, :decimal, precision: 8, scale: 2, default: 0.0
    add_column :royalty_reports, :cume_reserve, :decimal, precision: 8, scale: 2, default: 0.0
    add_column :royalty_reports, :liquidated_reserve, :decimal, precision: 8, scale: 2, default: 0.0
  end
end
