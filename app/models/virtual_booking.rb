class VirtualBooking < ActiveRecord::Base

  enum host: ['FM', 'Venue']

  include DateFieldYearsConverter
  before_validation :convert_date_field_years

  validates :film_id, :venue_id, presence: true
  validates :date_added, :start_date, :end_date, date: true
  validates_numericality_of :deduction, :box_office, :greater_than_or_equal_to => 0

  belongs_to :film
  belongs_to :venue
  has_many :payments, -> { order(:date) }, as: :booking, dependent: :destroy
  has_many :invoices, -> { order(:sent_date) }, as: :booking, dependent: :destroy

  def url_if_present
    (url.present? && url != "https://") ? url : nil
  end

  def self.delete_converted!
    file_path = Rails.root.join("./virtual-bookings.xlsx").to_s
    xlsx = Roo::Spreadsheet.open(file_path)
    sheet = xlsx.sheet(0)
    index = 2
    while index <= xlsx.last_row
      columns = sheet.row(index)
      type = columns[4]
      unless type == "Virtual"
        index += 1
        next
      end
      booking_id = columns[35]
      Booking.find(booking_id).destroy
      index += 1
    end
  end

end
