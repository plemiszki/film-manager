class AddDeliveryAcceptance < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :accept_delivery, :date
  end
end
