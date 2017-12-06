class AddTermsToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :payment_terms, :integer
  end
end
