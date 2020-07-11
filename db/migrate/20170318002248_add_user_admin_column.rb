class AddUserAdminColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :admin, :boolean
    change_column_default :users, :admin, false
  end
end
