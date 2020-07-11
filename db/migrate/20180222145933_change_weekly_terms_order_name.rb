class ChangeWeeklyTermsOrderName < ActiveRecord::Migration[5.2]
  def change
    rename_column :weekly_terms, :week, :order
  end
end
