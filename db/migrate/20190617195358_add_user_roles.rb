class AddUserRoles < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :access, :integer, default: 50
  end
end
