class Actorable < ActiveRecord::Migration[5.2]
  def change
    rename_column :actors, :film_id, :actorable_id
    add_column :actors, :actorable_type, :string
  end
end
