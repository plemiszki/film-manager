class AddCurrentShareMinusExpenses < ActiveRecord::Migration[5.2]
  def change
    add_column :royalty_reports, :current_share_minus_expenses, :decimal, precision: 8, scale: 2, default: 0
  end
end
