class AddNickname < ActiveRecord::Migration
  def change
    add_column :revenue_streams, :nickname, :text
  end
end
