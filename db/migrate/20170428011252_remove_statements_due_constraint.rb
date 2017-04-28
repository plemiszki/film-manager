class RemoveStatementsDueConstraint < ActiveRecord::Migration
  def change
    change_column_null :films, :days_statement_due, true
  end
end
