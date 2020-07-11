class RemoveMerchUniq < ActiveRecord::Migration[5.2]
  def change
    remove_index :merchandise_items, column: [:name, :merchandise_type_id]
  end
end
