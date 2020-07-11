class DigitalRetailersSageId < ActiveRecord::Migration[5.2]
  def change
    add_column :digital_retailers, :sage_id, :string, default: ""
  end
end
