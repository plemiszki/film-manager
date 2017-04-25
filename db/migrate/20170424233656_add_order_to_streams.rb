class AddOrderToStreams < ActiveRecord::Migration
  def change
    add_column :revenue_streams, :order, :integer
  end
end
