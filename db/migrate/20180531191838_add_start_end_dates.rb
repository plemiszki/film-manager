class AddStartEndDates < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :start_date, :date
    add_column :films, :end_date, :date
    add_column :films, :film_type, :string
  end
end
