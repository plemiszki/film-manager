class AddDatesToDvd < ActiveRecord::Migration[5.2]
  def change
    add_column :dvds, :pre_book_date, :date
    add_column :dvds, :retail_date, :date
  end
end
