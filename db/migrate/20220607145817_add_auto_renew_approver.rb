class AddAutoRenewApprover < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :has_auto_renew_approval, :boolean, default: false
  end
end
