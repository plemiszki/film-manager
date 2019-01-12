class RenameEpisodeName < ActiveRecord::Migration
  def change
    rename_column :episodes, :name, :title
  end
end
