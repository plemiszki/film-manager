class AddDayAndDate < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :day_and_date, :boolean, default: false
  end
end
