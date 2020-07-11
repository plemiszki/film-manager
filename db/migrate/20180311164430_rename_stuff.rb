class RenameStuff < ActiveRecord::Migration[5.2]
  def change
    rename_column :countries, :text, :name
    rename_column :languages, :text, :name
    rename_column :genres, :text, :name
    rename_column :topics, :text, :name
  end
end
