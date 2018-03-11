class AddBookerColumnToUsers < ActiveRecord::Migration
  def change
    add_column :users, :booker, :boolean, default: false
  end
end
