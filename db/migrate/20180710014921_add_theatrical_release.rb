class AddTheatricalRelease < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :theatrical_release, :date
  end
end
