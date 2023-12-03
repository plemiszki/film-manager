json.virtualBooking do
  json.id @virtual_booking.id
  json.filmId @virtual_booking.film_id
  json.venueId @virtual_booking.venue_id
  json.dateAdded @virtual_booking.date_added.strftime("%-m/%-d/%Y")
  json.startDate @virtual_booking.start_date.strftime("%-m/%-d/%Y")
  json.endDate @virtual_booking.end_date.strftime("%-m/%-d/%Y")
  json.shippingCity @virtual_booking.shipping_city || ""
  json.shippingState @virtual_booking.shipping_state || ""
  json.terms @virtual_booking.terms || ""
  json.url @virtual_booking.url || ""
  json.host @virtual_booking.host
  json.deduction dollarify(@virtual_booking.deduction)
  json.boxOffice dollarify(@virtual_booking.box_office)
  json.boxOfficeReceived @virtual_booking.box_office_received
  json.email @virtual_booking.email
  json.termsValid @calculations[:valid]
  json.reportSentDate @virtual_booking.report_sent_date.present? ? @virtual_booking.report_sent_date.strftime("%-m/%-d/%Y") : '(Not Sent)'
  json.billingName @virtual_booking.billing_name
  json.billingAddress1 @virtual_booking.billing_address1
  json.billingAddress2 @virtual_booking.billing_address2
  json.billingCity @virtual_booking.billing_city
  json.billingState @virtual_booking.billing_state
  json.billingZip @virtual_booking.billing_zip
  json.billingCountry @virtual_booking.billing_country
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
json.venues @venues do |venue|
  json.id venue.id
  json.label venue.label
end
json.invoices @virtual_booking.invoices do |invoice|
  json.id invoice.id
  json.sentDate invoice.sent_date.strftime("%-m/%-d/%Y")
  json.number invoice.number
  json.total dollarify(invoice.total)
  json.rows invoice.invoice_rows do |row|
    json.label row.item_label
    json.amount dollarify(row.total_price)
  end
  json.payments invoice.invoice_payments do |payment|
    json.id payment.payment_id
  end
end
json.payments @virtual_booking.payments do |payment|
  json.id payment.id
  json.amount dollarify(payment.amount)
  json.date payment.date.strftime("%-m/%-d/%Y")
  json.notes payment.notes
end
json.calculations do
  json.totalGross dollarify(@calculations[:total_gross])
  json.ourShare dollarify(@calculations[:our_share])
  json.received dollarify(@calculations[:received])
  json.owed dollarify(@calculations[:owed])
  json.overage dollarify(@calculations[:overage])
  json.venueShare dollarify(@calculations[:venue_share])
end
