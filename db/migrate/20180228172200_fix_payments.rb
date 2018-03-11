class FixPayments < ActiveRecord::Migration
  def change
    remove_column :payments, :decimal
  end
end
