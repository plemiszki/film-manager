class AddNextInvNumbers < ActiveRecord::Migration[5.2]
  def change
    add_column :settings, :next_booking_invoice_number, :integer
    add_column :settings, :next_dvd_invoice_number, :integer
  end
end
