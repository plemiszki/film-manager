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
  json.materialsSent booking.materials_sent ? 'Yes' : 'No'
  json.bookingType booking.booking_type
  json.status booking.status
  json.valid @calculations[booking.id][:valid]
  json.totalGross dollarify(number_with_precision(@calculations[booking.id][:total_gross], precision: 2, delimiter: ','))
  json.ourShare dollarify(number_with_precision(@calculations[booking.id][:our_share], precision: 2, delimiter: ','))
  json.received dollarify(number_with_precision(@calculations[booking.id][:received], precision: 2, delimiter: ','))
  json.owed dollarify(number_with_precision(@calculations[booking.id][:owed], precision: 2, delimiter: ','))
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
json.venues @venues do |venue|
  json.id venue.id
  json.label venue.label
end
json.users @users do |user|
  json.id user.id
  json.name user.name
  json.booker user.booker
end
json.formats @formats do |format|
  json.id format.id
  json.name format.name
end
