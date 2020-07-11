class AddOrderToStreams < ActiveRecord::Migration[5.2]
  def change
    add_column :revenue_streams, :order, :integer
  end
end
