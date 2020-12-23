class AddCreditMemoEmail < ActiveRecord::Migration[5.2]
  def change
    add_column :dvd_customers, :credit_memo_email, :string, default: ''
  end
end
