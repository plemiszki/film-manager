json.booking do
  json.id @booking.id
  json.filmId @booking.film_id
  json.venueId @booking.venue_id
  json.dateAdded @booking.date_added.strftime("%-m/%-d/%Y")
  json.bookingType @booking.booking_type
  json.status @booking.status
  json.startDate @booking.start_date.strftime("%-m/%-d/%Y")
  json.endDate @booking.end_date.strftime("%-m/%-d/%Y")
  json.terms @booking.terms
  json.termsChange @booking.attributes["terms_change"] # <-- not sure why .terms_change method returns nil
  json.advance dollarify(number_with_precision(@booking.advance, precision: 2, delimiter: ','))
  json.shippingFee dollarify(number_with_precision(@booking.shipping_fee, precision: 2, delimiter: ','))
  json.screenings @booking.screenings.to_s
  json.bookerId @booking.booker_id.to_s
  json.userId @booking.user_id.to_s
  json.pastBooker @booking.old_booker_id ? @booking.past_booker.name : ""
  json.pastUser @booking.old_user_id ? @booking.past_user.name : ""
  json.billingName @booking.billing_name
  json.billingAddress1 @booking.billing_address1
  json.billingAddress2 @booking.billing_address2
  json.billingCity @booking.billing_city
  json.billingState @booking.billing_state
  json.billingZip @booking.billing_zip
  json.billingCountry @booking.billing_country
  json.shippingName @booking.shipping_name
  json.shippingAddress1 @booking.shipping_address1
  json.shippingAddress2 @booking.shipping_address2
  json.shippingCity @booking.shipping_city
  json.shippingState @booking.shipping_state
  json.shippingZip @booking.shipping_zip
  json.shippingCountry @booking.shipping_country
  json.format @booking.format
  json.formatId @booking.format_id.to_s
  json.email @booking.email
  json.bookingConfirmationSent @booking.booking_confirmation_sent ? @booking.booking_confirmation_sent.strftime("%-m/%-d/%Y") : ''
  json.premiere @booking.premiere
  json.importedAdvanceInvoiceSent @booking.imported_advance_invoice_sent ? @booking.imported_advance_invoice_sent.strftime("%-m/%-d/%Y") : ''
  json.importedAdvanceInvoiceNumber @booking.imported_advance_invoice_number || ''
  json.importedOverageInvoiceSent @booking.imported_overage_invoice_sent ? @booking.imported_overage_invoice_sent.strftime("%-m/%-d/%Y") : ''
  json.importedOverageInvoiceNumber @booking.imported_overage_invoice_number || ''
  json.materialsSent @booking.materials_sent ? @booking.materials_sent.strftime("%-m/%-d/%Y") : ''
  json.noMaterials @booking.no_materials
  json.shippingNotes @booking.shipping_notes
  json.trackingNumber @booking.tracking_number
  json.delivered @booking.delivered
  json.houseExpense dollarify(number_with_precision(@booking.house_expense, precision: 2, delimiter: ','))
  json.notes @booking.notes
  json.deduction dollarify(number_with_precision(@booking.deduction, precision: 2, delimiter: ','))
  json.boxOffice dollarify(number_with_precision(@booking.box_office, precision: 2, delimiter: ','))
  json.boxOfficeReceived @booking.box_office_received
  json.termsValid @calculations[:valid]
  json.excludeFromBoRequests @booking.exclude_from_bo_requests
  json.stripeId @booking.get_stripe_id
  json.useStripe @booking.get_use_stripe
  json.useVenueStripeColumns @booking.use_venue_stripe_columns?
end
