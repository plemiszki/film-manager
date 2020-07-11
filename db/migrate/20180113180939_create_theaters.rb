class CreateTheaters < ActiveRecord::Migration[5.2]
  def change
    create_table :venues do |t|
      t.string :label, null: false
      t.string :billing_name, default: ""
      t.string :billing_address1, default: ""
      t.string :billing_address2, default: ""
      t.string :billing_city, default: ""
      t.string :billing_state, default: ""
      t.string :billing_zip, default: "", default: ""
      t.string :billing_country, default: ""
      t.string :shipping_name, default: ""
      t.string :shipping_address1, default: ""
      t.string :shipping_address2, default: ""
      t.string :shipping_city, default: ""
      t.string :shipping_state, default: ""
      t.string :shipping_zip, default: ""
      t.string :shipping_country, default: ""
      t.string :website, default: ""
      t.string :sage_id, null: false
      t.string :email, default: ""
      t.string :phone, default: ""
      t.string :notes, default: ""
      t.string :venue_type, null: false
    end
  end
end
