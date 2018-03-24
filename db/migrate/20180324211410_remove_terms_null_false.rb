class RemoveTermsNullFalse < ActiveRecord::Migration
  def change
    change_column_null :bookings, :terms, true
  end
end
