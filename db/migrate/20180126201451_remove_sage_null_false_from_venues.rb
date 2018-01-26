class RemoveSageNullFalseFromVenues < ActiveRecord::Migration
  def change
    change_column_null :venues, :sage_id, true
  end
end
