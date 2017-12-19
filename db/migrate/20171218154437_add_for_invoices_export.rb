class AddForInvoicesExport < ActiveRecord::Migration
  def change
    add_column :invoices, :customer_id, :integer
    add_column :invoice_rows, :job_id, :string
  end
end
