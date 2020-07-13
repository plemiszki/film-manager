class AddOrderToDirectors < ActiveRecord::Migration[5.2]
  def change
    add_column :directors, :order, :integer, default: 0
  end
end
