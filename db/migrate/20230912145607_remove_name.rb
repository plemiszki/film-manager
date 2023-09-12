class RemoveName < ActiveRecord::Migration[7.0]
  def change
    remove_column :amazon_genres, :name
  end
end
