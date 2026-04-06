class ChangeEmailsUniqueConstraint < ActiveRecord::Migration[8.1]
  def change
    remove_index :emails, :mailgun_message_id
    add_index :emails, [:mailgun_message_id, :recipient], unique: true
  end
end
