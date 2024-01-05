class CreateInstitutionOrderFilms < ActiveRecord::Migration[7.0]
  def change
    create_table :institution_order_films do |t|
      t.integer :film_id, null: false
      t.integer :institution_order_id, null: false

      t.timestamps
    end

    add_index :institution_order_films, [:film_id, :institution_order_id], unique: true, name: "index_inst_order_films_on_film_id_and_inst_order_id"
  end
end
