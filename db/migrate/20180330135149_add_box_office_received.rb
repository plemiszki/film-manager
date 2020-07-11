class AddBoxOfficeReceived < ActiveRecord::Migration[5.2]
  def change
    add_column :bookings, :box_office_received, :boolean, default: false
  end
end
