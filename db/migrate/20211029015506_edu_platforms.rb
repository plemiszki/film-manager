class EduPlatforms < ActiveRecord::Migration[6.1]

  def change

    create_table :edu_platforms do |t|
      t.string :name, null: false
      t.timestamps
    end

    create_table :edu_platform_films do |t|
      t.integer :edu_platform_id, null: false
      t.integer :film_id, null: false
      t.string :url, default: ""
      t.timestamps
    end

    add_index :edu_platform_films, [:edu_platform_id, :film_id], unique: true

  end

end
