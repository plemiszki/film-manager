class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.timestamps null: false
      t.string :email, null: false, unique: true
      t.string :encrypted_password, limit: 128, null: false
      t.string :confirmation_token, limit: 128
      t.string :remember_token, limit: 128, null: false
      t.string :name, null: false
      t.string :title
      t.string :email_signature
    end

    add_index :users, :email
    add_index :users, :remember_token
  end
end
