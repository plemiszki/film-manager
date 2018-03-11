class ChangeWeeklyTermsOrderName < ActiveRecord::Migration
  def change
    rename_column :weekly_terms, :week, :order
  end
end
