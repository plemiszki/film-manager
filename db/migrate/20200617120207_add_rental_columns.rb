class AddRentalColumns < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :rental_price, :decimal, precision: 5, scale: 2, default: 0
    add_column :films, :rental_days, :integer, default: 0
  end
end
