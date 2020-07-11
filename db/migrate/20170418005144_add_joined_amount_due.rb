class AddJoinedAmountDue < ActiveRecord::Migration[5.2]
  def change
    add_column :royalty_revenue_streams, :joined_amount_due, :decimal, precision: 8, scale: 2, default: 0
  end
end
