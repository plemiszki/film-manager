class RenameEpisodeName < ActiveRecord::Migration[5.2]
  def change
    rename_column :episodes, :name, :title
  end
end
