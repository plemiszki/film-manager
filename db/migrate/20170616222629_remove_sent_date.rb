class RemoveSentDate < ActiveRecord::Migration[5.2]
  def change
    remove_column :royalty_reports, :sent_date
  end
end
