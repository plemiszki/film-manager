class AddEndDateCalc < ActiveRecord::Migration[6.1]
  def change
    add_column :film_rights, :end_date_calc, :date
  end
end
