class AddPaymentTerms < ActiveRecord::Migration
  def change
    add_column :dvd_customers, :payment_terms, :string, default: "30"
  end
end
