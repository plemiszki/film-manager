class EnhanceFilmRights < ActiveRecord::Migration[5.2]
  def change
    add_column :film_rights, :territory_id, :integer
    add_column :film_rights, :start_date, :date
    add_column :film_rights, :end_date, :date
  end
end
