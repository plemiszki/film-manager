class AddLicensors < ActiveRecord::Migration
  def change
    create_table :licensors do |t|
      t.string :name, null: false
      t.string :email
      t.string :address
    end
  end
end
