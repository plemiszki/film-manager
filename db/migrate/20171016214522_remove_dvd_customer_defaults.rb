class RemoveDvdCustomerDefaults < ActiveRecord::Migration
  def change
    change_column_default(:dvd_customers, :consignment, nil)
    change_column_default(:dvd_customers, :sage_id, nil)
    change_column_default(:dvd_customers, :invoices_email, nil)
    change_column_default(:dvd_customers, :payment_terms, nil)
    change_column_null :dvd_customers, :discount, false
    change_column_null :dvd_customers, :consignment, false
    change_column_null :dvd_customers, :sage_id, false
    change_column_null :dvd_customers, :invoices_email, false
    change_column_null :dvd_customers, :payment_terms, false
  end
end
