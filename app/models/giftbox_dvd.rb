class GiftboxDvd < ActiveRecord::Base

  validates :giftbox_id, :dvd_id, presence: true
  validates :giftbox_id, uniqueness: { scope: :dvd_id }

  belongs_to :dvd
  belongs_to :giftbox

end
