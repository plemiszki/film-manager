class EnhanceFilmRights < ActiveRecord::Migration
  def change
    add_column :film_rights, :territory_id, :integer
    add_column :film_rights, :start_date, :date
    add_column :film_rights, :end_date, :date
  end
end
