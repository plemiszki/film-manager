class Booking < ActiveRecord::Base

  validates :film_id, :venue_id, :booking_type, :status, :terms, :booker_id, :user_id, :date_added, :start_date, :end_date, presence: true
  validates_numericality_of :advance, :shipping_fee, :house_expense, :deduction, :box_office, :greater_than_or_equal_to => 0
  validates_date :date_added, :start_date, :end_date
  validates_date :materials_sent, allow_blank: true

  belongs_to :film
  belongs_to :venue

  has_many :weekly_terms

end