class AddDonts < ActiveRecord::Migration
  def change
    add_column :films, :export_reports, :boolean, default: true
    add_column :films, :send_reports, :boolean, default: true
  end
end
