class ExclusiveRights < ActiveRecord::Migration
  def change
    add_column :film_rights, :exclusive, :boolean, default: false
  end
end
