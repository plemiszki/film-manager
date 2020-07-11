class CreateEpisodes < ActiveRecord::Migration[5.2]
  def change
    create_table :episodes do |t|
      t.string :name, null: false
      t.integer :episode_number, null: false
      t.integer :season_number, null: false
      t.integer :length, null: false
      t.string :synopsis, default: ''
    end
  end
end
