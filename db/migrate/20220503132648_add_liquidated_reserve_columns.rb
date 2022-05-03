class AddLiquidatedReserveColumns < ActiveRecord::Migration[6.1]
  def change
    add_column :royalty_reports, :cume_liquidated_reserve, :decimal, precision: 8, scale: 2, default: "0.0"
    add_column :royalty_reports, :current_liquidated_reserve, :decimal, precision: 8, scale: 2, default: "0.0"
    rename_column :royalty_reports, :liquidated_reserve, :joined_liquidated_reserve
  end
end
