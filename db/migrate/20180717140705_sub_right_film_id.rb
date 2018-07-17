class SubRightFilmId < ActiveRecord::Migration
  def change
    add_column :sub_rights, :film_id, :integer, null: false
  end
end
