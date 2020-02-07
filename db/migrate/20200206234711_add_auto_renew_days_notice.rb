class AddAutoRenewDaysNotice < ActiveRecord::Migration
  def change
    add_column :films, :auto_renew_days_notice, :integer, default: 0
  end
end
