json.bookings @bookings do |booking|
  json.id booking.id
  json.dateAdded booking.date_added.strftime("%-m/%-d/%y")
  json.film booking.film.title
  json.venue booking.venue.label
  json.startDate booking.start_date.strftime("%-m/%-d/%y")
  json.endDate booking.end_date.strftime("%-m/%-d/%y")
  json.city booking.shipping_city
  json.state booking.shipping_state
  json.terms booking.terms
  json.type booking.booking_type
  json.status booking.status
  json.format booking.format.name
  json.materialsSent booking.materials_sent ? 'Yes' : 'No'
  json.boxOfficeReceived booking.box_office_received || booking.weekly_box_offices.length > 0 ? 'Yes' : 'No'
  json.totalGross @calculations[booking.id][:valid] ? dollarify(number_with_precision(@calculations[booking.id][:total_gross], precision: 2, delimiter: ',')) : '(Invalid)'
  json.ourShare @calculations[booking.id][:valid] ? dollarify(number_with_precision(@calculations[booking.id][:our_share], precision: 2, delimiter: ',')) : '(Invalid)'
  json.received @calculations[booking.id][:valid] ? dollarify(number_with_precision(@calculations[booking.id][:received], precision: 2, delimiter: ',')) : '(Invalid)'
  json.owed @calculations[booking.id][:valid] ? dollarify(number_with_precision(@calculations[booking.id][:owed], precision: 2, delimiter: ',')) : '(Invalid)'
end
json.pageNumbers @page_numbers
json.morePages @more_pages
