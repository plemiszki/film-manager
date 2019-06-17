class AddUserRoles < ActiveRecord::Migration
  def change
    add_column :users, :access, :integer, default: 50
  end
end
