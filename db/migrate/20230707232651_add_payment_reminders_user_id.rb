class AddPaymentRemindersUserId < ActiveRecord::Migration[7.0]
  def change
    add_column :settings, :payment_reminders_user_id, :integer
  end
end
