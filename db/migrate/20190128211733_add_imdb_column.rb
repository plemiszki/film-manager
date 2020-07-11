class AddImdbColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :imdb_id, :string, default: ""
  end
end
