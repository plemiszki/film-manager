class AddJoinedReserve < ActiveRecord::Migration[5.2]
  def change
    add_column :royalty_reports, :joined_reserve, :decimal, precision: 8, scale: 2, default: 0.0
  end
end
