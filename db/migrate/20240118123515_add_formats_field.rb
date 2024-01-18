class AddFormatsField < ActiveRecord::Migration[7.0]
  def change
    add_column :institution_order_films, :formats, :string, default: ""
  end
end
