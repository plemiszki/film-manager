class AddJobName < ActiveRecord::Migration[5.2]
  def change
    add_column :jobs, :name, :string
  end
end
