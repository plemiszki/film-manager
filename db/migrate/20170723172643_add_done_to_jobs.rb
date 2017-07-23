class AddDoneToJobs < ActiveRecord::Migration
  def change
    add_column :jobs, :done, :boolean, default: false
  end
end
