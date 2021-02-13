class VirtualBooking < ActiveRecord::Base

  enum host: ['FM', 'Venue']

  validates :film_id, :venue_id, :date_added, :start_date, :end_date, presence: true
  validates_date :date_added, :start_date, :end_date

  belongs_to :film
  belongs_to :venue

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
