class AddInTheatersSection < ActiveRecord::Migration[5.2]
  def change
    add_column :in_theaters_films, :section, :text
  end
end
