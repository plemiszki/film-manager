class AddBoxOfficeReceived < ActiveRecord::Migration
  def change
    add_column :bookings, :box_office_received, :boolean, default: false
  end
end
