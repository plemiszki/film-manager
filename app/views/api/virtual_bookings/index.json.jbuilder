json.virtualBookings @virtual_bookings do |booking|
  json.id booking.id
  json.dateAdded booking.date_added.strftime("%-m/%-d/%y")
  json.film booking.film.title
  json.venue booking.venue.label
  json.startDate booking.start_date.strftime("%-m/%-d/%y")
  json.endDate booking.end_date.strftime("%-m/%-d/%y")
  json.city booking.shipping_city
  json.state booking.shipping_state
  json.boxOfficeReceived booking.box_office_received ? 'Yes' : 'No'
  json.invoiceOrReportSent (booking.report_sent_date.present? || booking.invoices.length > 1) ? 'Yes' : 'No'
  json.host booking.host
  json.hasUrl booking.url.present? ? 'Yes' : 'No'
end
json.pageNumbers @page_numbers
json.morePages @more_pages
