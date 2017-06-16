class AddDateSentToRoyalties < ActiveRecord::Migration
  def change
    add_column :royalty_reports, :date_sent, :date
  end
end
