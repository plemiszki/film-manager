class RemoveDeadColumns < ActiveRecord::Migration[8.1]
  def change
    # never populated; features link to DVDs via dvds.feature_film_id
    remove_index :films, :feature_id, name: "index_films_on_feature_id"
    remove_column :films, :feature_id, :integer

    # never set to true and not referenced anywhere
    remove_column :territories, :world, :boolean, default: false

    # never written; always 0.00
    remove_column :invoices, :sub_total, :decimal, precision: 8, scale: 2, default: "0.0"
  end
end
