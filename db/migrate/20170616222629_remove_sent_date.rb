class RemoveSentDate < ActiveRecord::Migration
  def change
    remove_column :royalty_reports, :sent_date
  end
end
