class CreateSublicensors < ActiveRecord::Migration
  def change
    create_table :sublicensors do |t|
      t.string :name, null: false
      t.string :email, default: ""
      t.string :phone, default: ""
      t.string :contact_name, default: ""
      t.boolean :w8, default: false
    end
  end
end
