class AddMonthToInvoices < ActiveRecord::Migration
  def change
    add_column :purchase_orders, :month, :integer
  end
end
