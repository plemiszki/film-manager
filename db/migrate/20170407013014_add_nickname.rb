class AddNickname < ActiveRecord::Migration[5.2]
  def change
    add_column :revenue_streams, :nickname, :text
  end
end
