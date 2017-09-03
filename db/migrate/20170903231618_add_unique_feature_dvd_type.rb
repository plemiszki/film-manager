class AddUniqueFeatureDvdType < ActiveRecord::Migration
  def change
    add_index :dvds, [:dvd_type_id, :feature_film_id], unique: true
  end
end
