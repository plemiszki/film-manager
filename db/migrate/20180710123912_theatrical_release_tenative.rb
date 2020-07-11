class TheatricalReleaseTenative < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :theatrical_tentative, :boolean, default: false
  end
end
