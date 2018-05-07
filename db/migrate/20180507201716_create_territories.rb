class CreateTerritories < ActiveRecord::Migration
  def change
    create_table :territories do |t|
      t.string :name, null: false
      t.boolean :world, default: false
    end
  end
end
