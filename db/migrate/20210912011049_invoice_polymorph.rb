class InvoicePolymorph < ActiveRecord::Migration[6.1]
  def change
    add_column :invoices, :booking_type, :string, default: 'Booking'
  end
end
