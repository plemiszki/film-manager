class CreateLabels < ActiveRecord::Migration
  def change
    add_column :films, :active, :boolean, default: true
  end
end
