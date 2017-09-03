class AddDvdTypes < ActiveRecord::Migration
  def change
    create_table :dvd_types do |t|
      t.string :name, null: false
    end
  end
end
