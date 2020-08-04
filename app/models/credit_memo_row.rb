class CreditMemoRow < ActiveRecord::Base

  validates :credit_memo_id, :item_label, :item_qty, :dvd_id, null: false

  belongs_to :credit_memo
  belongs_to :dvd

end
