class AddOrderColumns < ActiveRecord::Migration[5.2]
  def change
    add_column :quotes, :order, :integer, null: false
    add_column :laurels, :order, :integer, null: false
    add_column :related_films, :order, :integer, null: false
  end
end
