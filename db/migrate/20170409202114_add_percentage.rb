class AddPercentage < ActiveRecord::Migration[5.2]
  def change
    add_column :royalty_revenue_streams, :licensor_percentage, :decimal, precision: 5, scale: 2, default: 0
  end
end
