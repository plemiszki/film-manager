class AddCheckboxes < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :edu_page, :boolean, default: false
    add_column :films, :video_page, :boolean, default: false
  end
end
