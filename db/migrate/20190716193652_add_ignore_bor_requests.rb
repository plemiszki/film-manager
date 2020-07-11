class AddIgnoreBorRequests < ActiveRecord::Migration[5.2]
  def change
    add_column :bookings, :exclude_from_bo_requests, :boolean, default: false
  end
end
