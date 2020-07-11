class CreateAlternateLengths < ActiveRecord::Migration[5.2]
  def change
    create_table :alternate_lengths do |t|
      t.integer :film_id, null: false
      t.integer :length, null: false
      t.timestamps null: false
    end

    add_index :alternate_lengths, [:film_id, :length], unique: true
  end
end
