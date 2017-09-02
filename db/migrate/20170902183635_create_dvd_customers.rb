class CreateDvdCustomers < ActiveRecord::Migration
  def change
    create_table :dvd_customers do |t|
      t.string :name, null: false
      t.decimal :discount, precision: 5, scale: 2
      t.boolean :consignment, default: false
      t.string :address, default: ""
      t.string :notes, default: ""
    end
  end
end
