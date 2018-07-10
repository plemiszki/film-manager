class AddTheatricalRelease < ActiveRecord::Migration
  def change
    add_column :films, :theatrical_release, :date
  end
end
