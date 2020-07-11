class ExclusiveRights < ActiveRecord::Migration[5.2]
  def change
    add_column :film_rights, :exclusive, :boolean, default: false
  end
end
