class EduOrderChanges < ActiveRecord::Migration[7.0]
  def change
    remove_column :institution_orders, :price
    remove_column :institution_orders, :licensed_rights
    rename_column :institution_orders, :notes, :internal_notes
    add_column :institution_orders, :invoice_notes, :string, default: ""
  end
end
