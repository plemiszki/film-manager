class AddDoneToJobs < ActiveRecord::Migration[5.2]
  def change
    add_column :jobs, :done, :boolean, default: false
  end
end
