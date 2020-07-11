class ChangeImportedInvoicesColumns < ActiveRecord::Migration[5.2]
  def change
    rename_column :bookings, :advance_invoice_id, :imported_advance_invoice_number
    change_column :bookings, :imported_advance_invoice_number, :string
    rename_column :bookings, :advance_invoice_sent, :imported_advance_invoice_sent

    rename_column :bookings, :overage_invoice_id, :imported_overage_invoice_number
    change_column :bookings, :imported_overage_invoice_number, :string
    rename_column :bookings, :overage_invoice_sent, :imported_overage_invoice_sent
  end
end
