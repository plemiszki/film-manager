class AddInvoicesNum < ActiveRecord::Migration[5.2]
  def change
    add_column :invoices, :num, :integer
    add_column :credit_memos, :num, :integer
  end
end
