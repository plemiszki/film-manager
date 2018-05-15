class VenueContact < ActiveRecord::Migration
  def change
    add_column :venues, :contact_name, :string, default: ""
  end
end
