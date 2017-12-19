class ChangeOfPlans < ActiveRecord::Migration
  def change
    remove_column :invoice_rows, :job_id
    add_column :invoice_rows, :item_id, :integer
    add_column :invoice_rows, :item_type, :string
  end
end
