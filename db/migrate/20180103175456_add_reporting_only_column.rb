class AddReportingOnlyColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :purchase_orders, :reporting_only, :boolean, default: false
  end
end
