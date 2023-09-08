class RemoveAmazonV1 < ActiveRecord::Migration[7.0]
  def change
    remove_column :genres, :prime_code
    remove_column :languages, :prime_code
    add_column :amazon_languages, :code, :string, null: false
    add_index :amazon_languages, :code, unique: true
  end
end
