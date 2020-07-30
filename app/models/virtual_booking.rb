class VirtualBooking < ActiveRecord::Base

  validates :film_id, :venue_id, :date_added, :start_date, :end_date, presence: true
  validates_date :date_added, :start_date, :end_date

  belongs_to :film
  belongs_to :venue

  def self.convert_virtual!
    missing_venues = []
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
      venue_name = columns[3].strip
      # venue_name = "Film Society of Lincoln Center" if venue_name == "Film at Lincoln Center"
      venue = Venue.find_by_label(venue_name)
      if venue.nil?
        missing_venues << venue_name
        index += 1
        next
      end
      booking_id = columns[35]
      booking = Booking.find(booking_id)
      city = columns[23]
      state = columns[24]
      url = columns[34] || ""
      VirtualBooking.create!(
        film_id: booking.film.id,
        venue_id: venue.id,
        date_added: booking.date_added,
        start_date: booking.start_date,
        end_date: booking.end_date,
        shipping_city: city,
        shipping_state: state,
        terms: booking.terms,
        url: url
      )
      index += 1
      IO.popen('pbcopy', 'w') { |f| f << missing_venues.uniq.join("\n") }
    end
  end

end
