class Setting < ActiveRecord::Base

  validates :booking_confirmation_text, presence: true

end
