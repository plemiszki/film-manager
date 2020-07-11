class AddIncludeReportColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :dvd_customers, :include_in_title_report, :boolean, default: false
  end
end
