class AddDealModel < ActiveRecord::Migration
  def change
    create_table :deal_templates do |t|
      t.string :name, null: false
    end
  end
end
