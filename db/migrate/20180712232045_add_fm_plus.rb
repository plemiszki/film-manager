class AddFmPlus < ActiveRecord::Migration
  def change
    add_column :films, :fm_plus_url, :string, default: ""
  end
end
