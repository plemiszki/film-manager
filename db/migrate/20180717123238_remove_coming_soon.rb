class RemoveComingSoon < ActiveRecord::Migration
  def change
    remove_column :in_theaters_films, :coming_soon
    change_column_null :in_theaters_films, :section, false
  end
end
