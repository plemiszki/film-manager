class RemoveDvdTypesIndex < ActiveRecord::Migration[7.0]
  def change
    remove_index :dvds, name: "index_dvds_on_dvd_type_id_and_feature_film_id"
  end
end
