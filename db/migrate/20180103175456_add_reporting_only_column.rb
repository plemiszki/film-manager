class AddReportingOnlyColumn < ActiveRecord::Migration
  def change
    add_column :purchase_orders, :reporting_only, :boolean, default: false
  end
end
