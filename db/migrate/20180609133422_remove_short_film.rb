class RemoveShortFilm < ActiveRecord::Migration[5.2]
  def change
    remove_column :films, :short_film
  end
end
