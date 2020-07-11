class AddDefaultDvdPrice < ActiveRecord::Migration[5.2]
  def change
    change_column_default(:dvds, :price, 0.0)
  end
end
