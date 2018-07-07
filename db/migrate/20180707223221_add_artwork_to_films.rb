class AddArtworkToFilms < ActiveRecord::Migration
  def change
    add_column :films, :artwork_url, :string, default: ""
  end
end
