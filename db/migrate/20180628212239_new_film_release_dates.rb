class NewFilmReleaseDates < ActiveRecord::Migration
  def change
    add_column :films, :avod_release, :date
    add_column :films, :svod_release, :date
    add_column :films, :tvod_release, :date
  end
end
