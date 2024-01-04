class FixMaterialsSent < ActiveRecord::Migration[7.0]
  def change
    remove_column :institution_orders, :materials_sent
    add_column :institution_orders, :materials_sent, :date
  end
end
