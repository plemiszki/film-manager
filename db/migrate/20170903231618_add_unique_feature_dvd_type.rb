class AddUniqueFeatureDvdType < ActiveRecord::Migration[5.2]
  def change
    add_index :dvds, [:dvd_type_id, :feature_film_id], unique: true
  end
end
