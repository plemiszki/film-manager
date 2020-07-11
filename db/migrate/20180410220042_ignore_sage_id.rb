class IgnoreSageId < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :ignore_sage_id, :boolean, default: false
  end
end
