class AddDvdCustomerNickname < ActiveRecord::Migration[5.2]

  def change
    add_column :dvd_customers, :nickname, :string, default: ''
  end

end
