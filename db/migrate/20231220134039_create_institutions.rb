class CreateInstitutions < ActiveRecord::Migration[7.0]
  def change
    create_table :institutions do |t|
      t.string :label,  null: false
      t.string :billing_name, default: ""
      t.string :billing_address_1, default: ""
      t.string :billing_address_2, default: ""
      t.string :billing_city, default: ""
      t.string :billing_state, default: ""
      t.string :billing_zip, default: ""
      t.string :billing_country, default: ""
      t.string :shipping_name, default: ""
      t.string :shipping_address_1, default: ""
      t.string :shipping_address_2, default: ""
      t.string :shipping_city, default: ""
      t.string :shipping_state, default: ""
      t.string :shipping_zip, default: ""
      t.string :shipping_country, default: ""
      t.string :contact_name, default: ""
      t.string :email, default: ""
      t.string :phone, default: ""
      t.string :notes, default: ""
      t.string :sage_id, default: ""
      t.timestamps
    end
  end
end
