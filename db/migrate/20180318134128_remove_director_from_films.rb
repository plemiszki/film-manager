class RemoveDirectorFromFilms < ActiveRecord::Migration[5.2]
  def change
    remove_column :films, :director
  end
end
