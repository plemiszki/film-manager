class ChangeReturnColumns < ActiveRecord::Migration
  def change
    add_column :returns, :month, :integer, null: false
    add_column :returns, :year, :integer, null: false
    add_column :return_items, :amount, :decimal, precision: 8, scale: 2, default: 0.0
  end
end
