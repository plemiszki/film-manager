class RemoveFormatColumn < ActiveRecord::Migration
  def change
    remove_column :bookings, :format
  end
end
