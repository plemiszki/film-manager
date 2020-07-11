class FixPayments < ActiveRecord::Migration[5.2]
  def change
    remove_column :payments, :decimal
  end
end
