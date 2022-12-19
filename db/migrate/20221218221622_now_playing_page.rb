class NowPlayingPage < ActiveRecord::Migration[7.0]
  def change
    add_column :films, :now_playing_page, :boolean, default: false
  end
end
