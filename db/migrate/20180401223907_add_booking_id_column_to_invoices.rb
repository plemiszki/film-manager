class AddBookingIdColumnToInvoices < ActiveRecord::Migration[5.2]
  def change
    add_column :invoices, :booking_id, :integer
    add_index :invoices, :booking_id
  end
end
