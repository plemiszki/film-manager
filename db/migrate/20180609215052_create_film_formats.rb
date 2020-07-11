class CreateFilmFormats < ActiveRecord::Migration[5.2]
  def change
    create_table :film_formats do |t|
      t.integer :film_id, null: false
      t.integer :format_id, null: false
    end
  end
end
