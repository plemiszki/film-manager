class RemoveStatementsDueConstraint < ActiveRecord::Migration[5.2]
  def change
    change_column_null :films, :days_statement_due, true
  end
end
