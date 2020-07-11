class FixTypo < ActiveRecord::Migration[5.2]
  def change
    drop_table :revenue_steams
    create_table :revenue_streams do |t|
      t.string :name, null: false
    end
  end
end
