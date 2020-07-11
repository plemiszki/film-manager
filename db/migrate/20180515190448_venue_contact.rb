class VenueContact < ActiveRecord::Migration[5.2]
  def change
    add_column :venues, :contact_name, :string, default: ""
  end
end
