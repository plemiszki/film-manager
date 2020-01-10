class CreateAlternateAudios < ActiveRecord::Migration
  def change
    create_table :alternate_audios do |t|
      t.integer :film_id, null: false
      t.integer :language_id, null: false
      t.timestamps null: false
    end

    add_index :alternate_audios, [:film_id, :language_id], unique: true
  end
end
