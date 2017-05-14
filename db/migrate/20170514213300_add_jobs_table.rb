class AddJobsTable < ActiveRecord::Migration
  def change
    create_table :jobs do |t|
      t.string :job_id, null: false
      t.string :first_line
      t.boolean :second_line, default: false
      t.integer :current_value, default: 0
      t.integer :total_value, default: 0
      t.string :errors
    end

    add_column :royalty_reports, :sent_date, :string
  end
end
