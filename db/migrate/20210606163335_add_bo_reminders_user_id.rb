class AddBoRemindersUserId < ActiveRecord::Migration[6.1]
  def change
    add_column :settings, :box_office_reminders_user_id, :integer
  end
end
