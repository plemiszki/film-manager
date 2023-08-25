class AmazonGenres < ActiveRecord::Migration[7.0]
  def change
    add_column :genres, :prime_code, :string, default: ""
  end
end
