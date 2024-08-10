class XmlFields < ActiveRecord::Migration[7.0]
  def change
    add_column :films, :xml_video_filename, :string, default: ""
    add_column :films, :xml_trailer_filename, :string, default: ""
    add_column :films, :xml_subtitles_filename, :string, default: ""
    add_column :films, :xml_caption_filename, :string, default: ""
    add_column :films, :xml_include_trailer, :boolean, default: true
    add_column :films, :xml_include_captions, :boolean, default: true
    add_column :films, :xml_mmc_filename, :string, default: ""
    add_column :films, :xml_mec_filename, :string, default: ""
  end
end
