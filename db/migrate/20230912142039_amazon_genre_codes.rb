class AmazonGenreCodes < ActiveRecord::Migration[7.0]
  def change
    add_column :amazon_genres, :code, :string, null: false
    add_index :amazon_genres, :code, unique: true
  end
end
