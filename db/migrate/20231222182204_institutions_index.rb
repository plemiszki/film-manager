class InstitutionsIndex < ActiveRecord::Migration[7.0]
  def change
    add_index :institutions, :label, unique: true
  end
end
