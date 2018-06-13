class RemoveFilmRightValue < ActiveRecord::Migration
  def change
    remove_column :film_rights, :value
  end
end
