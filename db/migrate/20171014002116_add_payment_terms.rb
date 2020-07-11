class AddPaymentTerms < ActiveRecord::Migration[5.2]
  def change
    add_column :dvd_customers, :payment_terms, :string, default: "30"
  end
end
