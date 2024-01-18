class RemoveOrderFormats < ActiveRecord::Migration[7.0]
  def change
    drop_table :institution_order_formats
  end
end
