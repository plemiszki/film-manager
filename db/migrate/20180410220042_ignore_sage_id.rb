class IgnoreSageId < ActiveRecord::Migration
  def change
    add_column :films, :ignore_sage_id, :boolean, default: false
  end
end
