class AddDirector < ActiveRecord::Migration
  def change
    add_column :films, :director, :string, default: ""
  end
end
