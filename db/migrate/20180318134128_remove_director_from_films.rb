class RemoveDirectorFromFilms < ActiveRecord::Migration
  def change
    remove_column :films, :director
  end
end
