class AddDvdTypes < ActiveRecord::Migration[5.2]
  def change
    create_table :dvd_types do |t|
      t.string :name, null: false
    end
  end
end
