class AddImdbColumn < ActiveRecord::Migration
  def change
    add_column :films, :imdb_id, :string, default: ""
  end
end
