class AddStuffToReports < ActiveRecord::Migration[5.2]
  def change
    add_column :royalty_reports, :deal_id, :integer
    change_column :royalty_reports, :deal_id, :integer, null: false
    add_column :royalty_reports, :gr_percentage, :decimal, precision: 5, scale: 2, default: 0
  end
end
