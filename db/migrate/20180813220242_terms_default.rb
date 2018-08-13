class TermsDefault < ActiveRecord::Migration
  def change
    change_column_default :bookings, :terms, ""
  end
end
