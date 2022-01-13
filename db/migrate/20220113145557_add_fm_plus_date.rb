class AddFmPlusDate < ActiveRecord::Migration[6.1]
  def change
    add_column :films, :fm_plus_release, :date
    add_column :films, :fm_plus_tentative, :boolean, default: false
  end
end
