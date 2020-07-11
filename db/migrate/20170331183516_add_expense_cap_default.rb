class AddExpenseCapDefault < ActiveRecord::Migration[5.2]
  def change
    change_column_default :films, :expense_cap, 0
  end
end
