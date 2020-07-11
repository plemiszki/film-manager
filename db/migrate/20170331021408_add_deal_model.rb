class AddDealModel < ActiveRecord::Migration[5.2]
  def change
    create_table :deal_templates do |t|
      t.string :name, null: false
    end
  end
end
