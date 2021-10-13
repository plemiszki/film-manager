class SubRightReminders < ActiveRecord::Migration[6.1]
  def change
    add_column :sub_rights, :expiration_reminders, :date, array: true, default: []
  end
end
