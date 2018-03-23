class Booking < ActiveRecord::Base

  validates :film_id, :venue_id, :booking_type, :status, :terms, :date_added, :start_date, :end_date, presence: true
  validates_numericality_of :advance, :shipping_fee, :house_expense, :deduction, :box_office, :greater_than_or_equal_to => 0
  validates_date :date_added, :start_date, :end_date
  validates_date :materials_sent, allow_blank: true

  belongs_to :film
  belongs_to :venue
  belongs_to :past_booker, foreign_key: :old_booker_id
  belongs_to :past_user, class_name: "PastBooker", foreign_key: :old_user_id

  has_many :weekly_terms

end
