class AddErrorsTextDefault < ActiveRecord::Migration[5.2]
  def change
    change_column_default :jobs, :errors_text, ""
  end
end
