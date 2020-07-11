class AddNewFilmVars < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :sell_off_period, :integer, default: 0
    add_column :films, :auto_renew, :boolean, default: false
    add_column :films, :auto_renew_term, :integer, default: 0
  end
end
