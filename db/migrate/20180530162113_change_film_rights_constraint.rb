class ChangeFilmRightsConstraint < ActiveRecord::Migration[5.2]
  def change
    remove_index :film_rights, [:film_id, :right_id]
    add_index :film_rights, [:right_id, :film_id, :territory_id], unique: true
  end
end
