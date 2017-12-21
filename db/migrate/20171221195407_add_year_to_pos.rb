class AddYearToPos < ActiveRecord::Migration
  def change
    add_column :purchase_orders, :year, :integer
  end
end
