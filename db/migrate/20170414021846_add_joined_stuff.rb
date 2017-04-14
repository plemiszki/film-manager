class AddJoinedStuff < ActiveRecord::Migration
  def change
    add_column :royalty_revenue_streams, :joined_revenue, :decimal, precision: 8, scale: 2, default: 0
    add_column :royalty_revenue_streams, :joined_gr, :decimal, precision: 8, scale: 2, default: 0
    add_column :royalty_revenue_streams, :joined_expense, :decimal, precision: 8, scale: 2, default: 0
    add_column :royalty_revenue_streams, :joined_difference, :decimal, precision: 8, scale: 2, default: 0
    add_column :royalty_revenue_streams, :joined_licensor_share, :decimal, precision: 8, scale: 2, default: 0
  end
end
