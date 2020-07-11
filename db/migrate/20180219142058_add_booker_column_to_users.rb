class AddBookerColumnToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :booker, :boolean, default: false
  end
end
