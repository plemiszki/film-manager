class SubtitlesToggle < ActiveRecord::Migration[8.0]
  def change
    add_column :films, :xml_include_subtitles, :boolean, default: true
  end
end
