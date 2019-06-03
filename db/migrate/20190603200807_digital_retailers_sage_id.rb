class DigitalRetailersSageId < ActiveRecord::Migration
  def change
    add_column :digital_retailers, :sage_id, :string, default: ""
  end
end
