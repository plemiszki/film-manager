class AddMissingIndicies < ActiveRecord::Migration
  def change
    add_index :royalty_reports, :film_id
    add_index :royalty_revenue_streams, :royalty_report_id
    add_index :royalty_revenue_streams, :revenue_stream_id
  end
end
