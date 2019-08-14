class Timestamps < ActiveRecord::Migration
  def change
    add_column :films, :created_at, :datetime
    add_column :films, :updated_at, :datetime
    add_column :royalty_reports, :created_at, :datetime
    add_column :royalty_reports, :updated_at, :datetime
  end
end
