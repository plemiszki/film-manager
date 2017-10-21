class AddPerUnit < ActiveRecord::Migration
  def change
    add_column :dvd_customers, :per_unit, :decimal, precision: 5, scale: 2
    change_column_null :dvd_customers, :discount, true
  end
end
