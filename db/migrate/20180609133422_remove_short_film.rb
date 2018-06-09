class RemoveShortFilm < ActiveRecord::Migration
  def change
    remove_column :films, :short_film
  end
end
