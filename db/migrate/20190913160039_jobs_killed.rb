class JobsKilled < ActiveRecord::Migration
  def change
    add_column :jobs, :killed, :boolean, default: false
  end
end
