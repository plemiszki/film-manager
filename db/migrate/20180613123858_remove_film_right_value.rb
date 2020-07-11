class RemoveFilmRightValue < ActiveRecord::Migration[5.2]
  def change
    remove_column :film_rights, :value
  end
end
