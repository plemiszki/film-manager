class AddExpenseCapDefault < ActiveRecord::Migration
  def change
    change_column_default :films, :expense_cap, 0
  end
end
