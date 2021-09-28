class AddExportLabels < ActiveRecord::Migration[6.1]
  def change
    add_column :invoice_rows, :item_label_export, :string
  end
end
