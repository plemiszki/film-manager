class AddReservesVars < ActiveRecord::Migration
  def change
    add_column :films, :reserve, :boolean, default: false
    add_column :films, :reserve_percentage, :decimal, precision: 5, scale: 2, default: 0
    add_column :films, :reserve_quarters, :integer, default: 0
    add_column :films, :reserve_start_year, :integer, default: 0
    add_column :films, :reserve_start_quarter, :integer, default: 1
  end
end
