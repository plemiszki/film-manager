class MarketingCheckboxes < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :certified_fresh, :boolean, default: false
    add_column :films, :critics_pick, :boolean, default: false
  end
end
