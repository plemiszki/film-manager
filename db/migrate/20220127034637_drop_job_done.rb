class DropJobDone < ActiveRecord::Migration[6.1]
  def change
    remove_column :jobs, :done
  end
end
