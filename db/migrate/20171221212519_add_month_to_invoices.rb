class AddMonthToInvoices < ActiveRecord::Migration[5.2]
  def change
    add_column :purchase_orders, :month, :integer
  end
end
