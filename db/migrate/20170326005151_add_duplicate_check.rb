class AddDuplicateCheck < ActiveRecord::Migration
  def change
    add_index :films, [:title, :short_film], unique: true
    add_index :licensors, :name, unique: true
  end
end
