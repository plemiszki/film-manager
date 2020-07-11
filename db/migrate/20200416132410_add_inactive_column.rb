class AddInactiveColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :inactive, :boolean, default: false
  end
end
