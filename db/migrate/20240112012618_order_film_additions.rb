class OrderFilmAdditions < ActiveRecord::Migration[7.0]
  def change
    add_column :institution_order_films, :price, :decimal, precision: 7, scale: 2, default: 0
    add_column :institution_order_films, :licensed_rights, :integer, default: 0
  end
end
