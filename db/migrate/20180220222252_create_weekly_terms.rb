class CreateWeeklyTerms < ActiveRecord::Migration[5.2]
  def change
    create_table :weekly_terms do |t|
      t.integer :booking_id,  null: false
      t.string :terms, null: false
      t.integer :week, null: false
    end

    add_index :weekly_terms, :booking_id
  end
end
