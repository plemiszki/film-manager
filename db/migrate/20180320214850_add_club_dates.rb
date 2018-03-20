class AddClubDates < ActiveRecord::Migration
  def change
    add_column :films, :club_date, :date
  end
end
