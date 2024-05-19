class LicensorSageId < ActiveRecord::Migration[7.0]
  def change
    add_column :licensors, :sage_id, :string, default: ""
  end
end
