class AddClubDates < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :club_date, :date
  end
end
