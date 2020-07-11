class FixRevenueStreams < ActiveRecord::Migration[5.2]
  def change
    drop_table :revenue_stream
    create_table :revenue_steams do |t|
      t.string :name, null: false
    end
  end
end
