class RemoveMerchUniq < ActiveRecord::Migration
  def change
    remove_index :merchandise_items, column: [:name, :merchandise_type_id]
  end
end
