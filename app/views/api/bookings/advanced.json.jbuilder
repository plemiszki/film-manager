json.bookings @bookings do |booking|
  json.id booking.id
  json.startDate booking.start_date.strftime("%-m/%-d/%y")
  json.endDate booking.end_date.strftime("%-m/%-d/%y")
  json.film booking.film.title
  json.venue booking.venue.label
  json.dateAdded booking.date_added.strftime("%-m/%-d/%y")
  json.shippingCity booking.shipping_city
  json.shippingState booking.shipping_state
  json.terms booking.terms
  json.format booking.format ? booking.format.name : ''
  json.boxOfficeReceived booking.box_office_received ? 'Yes' : 'No'
  json.bookingType booking.booking_type
end
