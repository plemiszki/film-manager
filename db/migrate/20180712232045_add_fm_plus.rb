class AddFmPlus < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :fm_plus_url, :string, default: ""
  end
end
