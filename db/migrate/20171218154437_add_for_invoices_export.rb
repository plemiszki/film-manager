class AddForInvoicesExport < ActiveRecord::Migration[5.2]
  def change
    add_column :invoices, :customer_id, :integer
    add_column :invoice_rows, :job_id, :string
  end
end
