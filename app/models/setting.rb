class Setting < ActiveRecord::Base

  validates :booking_confirmation_text, presence: true

  def self.increment_credit_memo_number!
    first.update!(next_credit_memo_number: first.next_credit_memo_number + 1)
  end

end
