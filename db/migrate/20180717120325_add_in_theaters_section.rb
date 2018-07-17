class AddInTheatersSection < ActiveRecord::Migration
  def change
    add_column :in_theaters_films, :section, :text
  end
end
