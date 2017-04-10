class RenameReportRowsTable < ActiveRecord::Migration
  def change
    rename_table :royalty_revenue_stream, :royalty_revenue_streams
  end
end
