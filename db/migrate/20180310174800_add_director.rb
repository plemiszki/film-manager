class AddDirector < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :director, :string, default: ""
  end
end
