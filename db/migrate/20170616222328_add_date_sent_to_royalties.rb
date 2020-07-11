class AddDateSentToRoyalties < ActiveRecord::Migration[5.2]
  def change
    add_column :royalty_reports, :date_sent, :date
  end
end
