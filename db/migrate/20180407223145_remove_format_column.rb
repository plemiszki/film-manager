class RemoveFormatColumn < ActiveRecord::Migration[5.2]
  def change
    remove_column :bookings, :format
  end
end
