class AddErrorsTextDefault < ActiveRecord::Migration
  def change
    change_column_default :jobs, :errors_text, ""
  end
end
