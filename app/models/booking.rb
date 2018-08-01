class Booking < ActiveRecord::Base

  validates :film_id, :venue_id, :booking_type, :status, :date_added, :start_date, :end_date, :booker_id, presence: true
  validates_numericality_of :advance, :shipping_fee, :house_expense, :deduction, :box_office, :greater_than_or_equal_to => 0
  validates_date :date_added, :start_date, :end_date
  validates_date :materials_sent, :imported_advance_invoice_sent, :imported_overage_invoice_sent, :booking_confirmation_sent, allow_blank: true

  belongs_to :film
  belongs_to :venue
  belongs_to :format
  belongs_to :past_booker, foreign_key: :old_booker_id
  belongs_to :past_user, class_name: "PastBooker", foreign_key: :old_user_id

  has_many :weekly_terms, -> { order(:order) }
  has_many :weekly_box_offices, -> { order(:order) }
  has_many :payments
  has_many :invoices

end
