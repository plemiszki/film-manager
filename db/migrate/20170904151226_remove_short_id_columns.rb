class RemoveShortIdColumns < ActiveRecord::Migration
  def change
    remove_column :dvds, :short_film_id
    remove_column :dvds, :short_film_2_id
  end
end
