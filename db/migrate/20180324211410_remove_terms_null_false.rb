class RemoveTermsNullFalse < ActiveRecord::Migration[5.2]
  def change
    change_column_null :bookings, :terms, true
  end
end
