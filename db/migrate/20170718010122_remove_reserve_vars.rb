class RemoveReserveVars < ActiveRecord::Migration
  def change
    remove_column :films, :reserve_start_year
    remove_column :films, :reserve_start_quarter
  end
end
