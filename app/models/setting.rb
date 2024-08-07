class Setting < ActiveRecord::Base

  validates :booking_confirmation_text, presence: true
  validates_numericality_of :next_booking_invoice_number, :next_dvd_invoice_number, :next_institution_invoice_number

  has_one :box_office_reminders_sender, class_name: 'User', primary_key: :box_office_reminders_user_id, foreign_key: :id
  has_one :payment_reminders_sender, class_name: 'User', primary_key: :payment_reminders_user_id, foreign_key: :id

  def self.increment_credit_memo_number!
    first.update!(next_credit_memo_number: first.next_credit_memo_number + 1)
  end

end
