class AddDvdCustomerNickname < ActiveRecord::Migration

  def change
    add_column :dvd_customers, :nickname, :string, default: ''
  end

end
