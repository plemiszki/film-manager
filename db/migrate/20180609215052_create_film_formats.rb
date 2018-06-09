class CreateFilmFormats < ActiveRecord::Migration
  def change
    create_table :film_formats do |t|
      t.integer :film_id, null: false
      t.integer :format_id, null: false
    end
  end
end
