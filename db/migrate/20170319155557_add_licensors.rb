class AddLicensors < ActiveRecord::Migration[5.2]
  def change
    create_table :licensors do |t|
      t.string :name, null: false
      t.string :email
      t.string :address
    end
  end
end
