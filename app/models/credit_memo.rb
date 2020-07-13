class CreditMemo < ActiveRecord::Base

  validates :sent_date, :number, :return_number, :customer_id, presence: true
  validates :number, uniqueness: true

  has_many :credit_memo_rows, -> { order('credit_memo_rows.id') }, dependent: :destroy
  
  belongs_to :customer, class_name: 'DvdCustomer'
  belongs_to :return

end
