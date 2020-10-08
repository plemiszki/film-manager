class AddTvRating < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :tv_rating, :string, default: ""
  end
end
