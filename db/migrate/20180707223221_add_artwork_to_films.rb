class AddArtworkToFilms < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :artwork_url, :string, default: ""
  end
end
