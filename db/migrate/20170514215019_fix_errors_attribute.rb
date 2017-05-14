class FixErrorsAttribute < ActiveRecord::Migration
  def change
    remove_column :jobs, :errors
    add_column :jobs, :errors_text, :string
  end
end
