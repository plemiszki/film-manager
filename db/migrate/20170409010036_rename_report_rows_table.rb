class RenameReportRowsTable < ActiveRecord::Migration[5.2]
  def change
    rename_table :royalty_revenue_stream, :royalty_revenue_streams
  end
end
