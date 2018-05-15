json.venues @venues do |venue|
  json.id venue.id
  json.label venue.label
  json.venueType venue.venue_type
  json.sageId venue.sage_id
  json.email venue.email
  json.phone venue.phone
  json.billingName venue.billing_name
  json.billingAddress1 venue.billing_address1
  json.billingAddress2 venue.billing_address2
  json.billingCity venue.billing_city
  json.billingState venue.billing_state
  json.billingZip venue.billing_zip
  json.billingCountry venue.billing_country
  json.shippingName venue.shipping_name
  json.shippingAddress1 venue.shipping_address1
  json.shippingAddress2 venue.shipping_address2
  json.shippingCity venue.shipping_city
  json.shippingState venue.shipping_state
  json.shippingZip venue.shipping_zip
  json.shippingCountry venue.shipping_country
  json.notes venue.notes
  json.contactName venue.contact_name
end
json.bookings @bookings do |booking|
  json.id booking.id
  json.film booking.film.title
  json.startDate booking.start_date.strftime("%-m/%-d/%y")
end
