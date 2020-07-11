class CreateLabels < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :active, :boolean, default: true
  end
end
