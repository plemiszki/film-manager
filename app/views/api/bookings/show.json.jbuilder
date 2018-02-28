json.bookings @bookings do |booking|
  json.id booking.id
  json.filmId booking.film_id
  json.venueId booking.venue_id
  json.dateAdded booking.date_added.strftime("%-m/%-d/%y")
  json.bookingType booking.booking_type
  json.status booking.status
  json.startDate booking.start_date.strftime("%-m/%-d/%y")
  json.endDate booking.end_date.strftime("%-m/%-d/%y")
  json.terms booking.terms
  json.termsChange booking.attributes["terms_change"] # <-- not sure why .terms_change method returns nil
  json.advance dollarify(number_with_precision(booking.advance, precision: 2, delimiter: ','))
  json.shippingFee dollarify(number_with_precision(booking.shipping_fee, precision: 2, delimiter: ','))
  json.screenings booking.screenings.to_s
  json.bookerId booking.booker_id.to_s
  json.userId booking.user_id.to_s
  json.billingName booking.billing_name
  json.billingAddress1 booking.billing_address1
  json.billingAddress2 booking.billing_address2
  json.billingCity booking.billing_city
  json.billingState booking.billing_state
  json.billingZip booking.billing_zip
  json.billingCountry booking.billing_country
  json.shippingName booking.shipping_name
  json.shippingAddress1 booking.shipping_address1
  json.shippingAddress2 booking.shipping_address2
  json.shippingCity booking.shipping_city
  json.shippingState booking.shipping_state
  json.shippingZip booking.shipping_zip
  json.shippingCountry booking.shipping_country
  json.format booking.format
  json.email booking.email
  json.bookingConfirmationSent booking.booking_confirmation_sent ? booking.booking_confirmation_sent.strftime("%-m/%-d/%y") : ''
  json.premiere booking.premiere
  json.importedAdvanceInvoiceSent booking.imported_advance_invoice_sent || ''
  json.importedAdvanceInvoiceNumber booking.imported_advance_invoice_number || ''
  json.importedOverageInvoiceSent booking.imported_overage_invoice_sent || ''
  json.importedOverageInvoiceNumber booking.imported_overage_invoice_number || ''
  json.materialsSent booking.materials_sent ? booking.materials_sent.strftime("%-m/%-d/%y") : ''
  json.noMaterials booking.no_materials
  json.shippingNotes booking.shipping_notes
  json.trackingNumber booking.tracking_number
  json.delivered booking.delivered
  json.houseExpense dollarify(number_with_precision(booking.house_expense, precision: 2, delimiter: ','))
  json.notes booking.notes
  json.deduction dollarify(number_with_precision(booking.deduction, precision: 2, delimiter: ','))
  json.boxOffice dollarify(number_with_precision(booking.box_office, precision: 2, delimiter: ','))
end
json.weeklyTerms @weekly_terms do |weekly_term|
  json.id weekly_term.id
  json.order weekly_term.order
  json.terms weekly_term.terms
end
json.weeklyBoxOffice @weekly_box_offices do |weekly_box_office|
  json.id weekly_box_office.id
  json.order weekly_box_office.order
  json.amount dollarify(number_with_precision(weekly_box_office.amount, precision: 2, delimiter: ','))
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
