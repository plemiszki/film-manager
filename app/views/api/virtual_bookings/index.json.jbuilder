json.virtualBookings @virtual_bookings do |booking|
  json.id booking.id
  json.startDate booking.start_date.strftime("%-m/%-d/%y")
  json.startDateTimestamp booking.start_date.to_time.to_i
  json.endDate booking.end_date.strftime("%-m/%-d/%y")
  json.endDateTimestamp booking.end_date.to_time.to_i
  json.film booking.film.title
  json.venue booking.venue.label
  json.dateAdded booking.date_added.strftime("%-m/%-d/%y")
  json.dateAddedTimestamp booking.date_added.to_time.to_i
  json.shippingCity booking.shipping_city
  json.shippingState booking.shipping_state
end
