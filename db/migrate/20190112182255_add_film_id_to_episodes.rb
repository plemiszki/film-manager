class AddFilmIdToEpisodes < ActiveRecord::Migration[5.2]
  def change
    add_column :episodes, :film_id, :integer, null: false
  end
end
