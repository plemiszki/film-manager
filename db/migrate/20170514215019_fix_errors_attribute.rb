class FixErrorsAttribute < ActiveRecord::Migration[5.2]
  def change
    remove_column :jobs, :errors
    add_column :jobs, :errors_text, :string
  end
end
