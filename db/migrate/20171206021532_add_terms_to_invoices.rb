class AddTermsToInvoices < ActiveRecord::Migration[5.2]
  def change
    add_column :invoices, :payment_terms, :integer
  end
end
