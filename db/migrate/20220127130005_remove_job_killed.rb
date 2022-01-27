class RemoveJobKilled < ActiveRecord::Migration[6.1]
  def change
    remove_column :jobs, :killed
  end
end
