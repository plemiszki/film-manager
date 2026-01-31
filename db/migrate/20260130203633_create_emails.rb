class CreateEmails < ActiveRecord::Migration[8.0]
  def change
    create_table :emails do |t|
      t.string :email_type, null: false
      t.string :recipient, null: false
      t.string :subject, null: false
      t.integer :status, default: 0, null: false
      t.string :mailgun_message_id, null: false
      t.text :error_message
      t.datetime :sent_at, null: false
      t.datetime :delivered_at
      t.jsonb :metadata, default: {}
      t.references :sender, foreign_key: { to_table: :users }, index: true

      t.timestamps
    end

    add_index :emails, :mailgun_message_id, unique: true
    add_index :emails, :status
    add_index :emails, :email_type
  end
end
