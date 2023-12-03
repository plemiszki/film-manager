json.virtualBookings @virtual_bookings do |booking|
  json.id booking.id
  json.dateAdded booking.date_added.strftime("%-m/%-d/%Y")
  json.film booking.film.title
  json.venue booking.venue.label
  json.startDate booking.start_date.strftime("%-m/%-d/%Y")
  json.endDate booking.end_date.strftime("%-m/%-d/%Y")
  json.city booking.shipping_city
  json.state booking.shipping_state
  json.boxOfficeReceived booking.box_office_received ? 'Yes' : 'No'
  json.invoiceOrReportSent ((booking.host == 'FM' && booking.report_sent_date.present?) || (booking.host == 'Venue' && booking.invoices.length > 0)) ? 'Yes' : 'No'
  json.host booking.host
  json.hasUrl booking.url.present? ? 'Yes' : 'No'
end
json.pageNumbers @page_numbers
json.morePages @more_pages
