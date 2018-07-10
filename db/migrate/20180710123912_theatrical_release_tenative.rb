class TheatricalReleaseTenative < ActiveRecord::Migration
  def change
    add_column :films, :theatrical_tentative, :boolean, default: false
  end
end
