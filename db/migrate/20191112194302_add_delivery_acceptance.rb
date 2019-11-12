class AddDeliveryAcceptance < ActiveRecord::Migration
  def change
    add_column :films, :accept_delivery, :date
  end
end
