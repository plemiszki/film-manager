class CreateInstitutionOrderFormats < ActiveRecord::Migration[7.0]
  def change
    create_table :institution_order_formats do |t|
      t.integer :institution_order_id, null: false
      t.integer :format_id, null: false

      t.timestamps
    end

    add_index :institution_order_formats, [:format_id, :institution_order_id], unique: true, name: "index_inst_order_formats_on_format_id_and_inst_order_id"
  end
end
