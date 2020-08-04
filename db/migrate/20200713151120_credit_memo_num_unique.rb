class CreditMemoNumUnique < ActiveRecord::Migration[5.2]
  def change
    add_index :credit_memos, :number, unique: true
  end
end
