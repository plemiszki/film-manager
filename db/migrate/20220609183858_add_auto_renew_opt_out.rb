class AddAutoRenewOptOut < ActiveRecord::Migration[6.1]
  def change
    add_column :films, :auto_renew_opt_out, :boolean, default: false
  end
end
