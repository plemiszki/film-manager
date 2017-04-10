class AddPercentage < ActiveRecord::Migration
  def change
    add_column :royalty_revenue_streams, :licensor_percentage, :decimal, precision: 5, scale: 2, default: 0
  end
end
