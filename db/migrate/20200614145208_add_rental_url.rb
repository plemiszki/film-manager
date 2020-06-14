class AddRentalUrl < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :rental_url, :string, default: ""
  end
end
