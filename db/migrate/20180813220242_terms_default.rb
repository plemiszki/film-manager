class TermsDefault < ActiveRecord::Migration[5.2]
  def change
    change_column_default :bookings, :terms, ""
  end
end
