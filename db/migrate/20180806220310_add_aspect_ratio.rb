class AddAspectRatio < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :aspect_ratio, :text, default: ""
  end
end
