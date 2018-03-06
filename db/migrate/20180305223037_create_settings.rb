class CreateSettings < ActiveRecord::Migration
  def change
    create_table :settings do |t|
      t.string :booking_confirmation_text
    end
  end
end
