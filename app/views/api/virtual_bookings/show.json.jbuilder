json.virtualBooking do
  json.id @virtual_booking.id
  json.filmId @virtual_booking.film_id
  json.venueId @virtual_booking.venue_id
  json.dateAdded @virtual_booking.date_added.strftime("%-m/%-d/%y")
  json.startDate @virtual_booking.start_date.strftime("%-m/%-d/%y")
  json.endDate @virtual_booking.end_date.strftime("%-m/%-d/%y")
  json.shippingCity @virtual_booking.shipping_city || ""
  json.shippingState @virtual_booking.shipping_state || ""
  json.terms @virtual_booking.terms || ""
  json.url @virtual_booking.url || ""
  json.host @virtual_booking.host
  json.deduction dollarify(number_with_precision(@virtual_booking.deduction, precision: 2, delimiter: ','))
  json.boxOffice dollarify(number_with_precision(@virtual_booking.box_office, precision: 2, delimiter: ','))
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
json.venues @venues do |venue|
  json.id venue.id
  json.label venue.label
end
