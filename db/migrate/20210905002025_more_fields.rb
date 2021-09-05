class MoreFields < ActiveRecord::Migration[6.1]
  def change
    add_column :settings, :virtual_booking_report_text, :string, default: ""
    add_column :virtual_bookings, :report_sent, :date
  end
end
