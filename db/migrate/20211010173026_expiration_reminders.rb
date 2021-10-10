class ExpirationReminders < ActiveRecord::Migration[6.1]
  def change
    add_column :films, :expiration_reminders, :date, array: true, default: []
  end
end
