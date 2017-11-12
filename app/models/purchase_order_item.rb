class PurchaseOrderItem < ActiveRecord::Base

  belongs_to :purchase_order

  def item
    if item_type == 'dvd'
      Dvd.find(item_id)
    elsif item_type == 'giftbox'
      Giftbox.find(item_id)
    end
  end

end
