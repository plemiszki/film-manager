class AddYearToPos < ActiveRecord::Migration[5.2]
  def change
    add_column :purchase_orders, :year, :integer
  end
end
