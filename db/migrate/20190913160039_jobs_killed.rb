class JobsKilled < ActiveRecord::Migration[5.2]
  def change
    add_column :jobs, :killed, :boolean, default: false
  end
end
