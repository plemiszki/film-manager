class AddAspectRatio < ActiveRecord::Migration
  def change
    add_column :films, :aspect_ratio, :text, default: ""
  end
end
