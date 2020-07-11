class RemoveSageNullFalseFromVenues < ActiveRecord::Migration[5.2]
  def change
    change_column_null :venues, :sage_id, true
  end
end
