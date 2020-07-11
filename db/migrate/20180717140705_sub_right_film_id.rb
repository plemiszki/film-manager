class SubRightFilmId < ActiveRecord::Migration[5.2]
  def change
    add_column :sub_rights, :film_id, :integer, null: false
  end
end
