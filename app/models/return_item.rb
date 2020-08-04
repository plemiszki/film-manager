class ReturnItem < ActiveRecord::Base

  belongs_to :return
  belongs_to :dvd, foreign_key: :item_id

  def item
    if item_type == 'dvd'
      Dvd.find(item_id)
    elsif item_type == 'giftbox'
      Giftbox.find(item_id)
    end
  end

end
