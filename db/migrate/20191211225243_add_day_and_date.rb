class AddDayAndDate < ActiveRecord::Migration
  def change
    add_column :films, :day_and_date, :boolean, default: false
  end
end
