class AddMoreVbFields < ActiveRecord::Migration[6.1]
  def change
    add_column :virtual_bookings, :email, :string, default: ""
    add_column :virtual_bookings, :report_sent_date, :date
  end
end
