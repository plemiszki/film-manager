class AddDefaultDvdPrice < ActiveRecord::Migration
  def change
    change_column_default(:dvds, :price, 0.0)
  end
end
