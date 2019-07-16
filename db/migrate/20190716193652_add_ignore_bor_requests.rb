class AddIgnoreBorRequests < ActiveRecord::Migration
  def change
    add_column :bookings, :exclude_from_bo_requests, :boolean, default: false
  end
end
