class CreateNewFilmVars < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :year, :integer
    add_column :films, :length, :integer
    add_column :films, :synopsis, :string, default: ""
    add_column :films, :short_synopsis, :string, default: ""
    add_column :films, :logline, :string, default: ""
    add_column :films, :vod_synopsis, :string, default: ""
    add_column :films, :institutional_synopsis, :string, default: ""
    add_column :films, :vimeo_trailer, :string, default: ""
    add_column :films, :youtube_trailer, :string, default: ""
    add_column :films, :prores_trailer, :string, default: ""
    add_column :films, :standalone_site, :string, default: ""
    add_column :films, :facebook_link, :string, default: ""
    add_column :films, :twitter_link, :string, default: ""
    add_column :films, :instagram_link, :string, default: ""
  end
end
