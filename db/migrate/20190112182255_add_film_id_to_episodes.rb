class AddFilmIdToEpisodes < ActiveRecord::Migration
  def change
    add_column :episodes, :film_id, :integer, null: false
  end
end
