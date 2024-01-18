json.institutionOrder do
  json.id @institution_order.id
  json.institutionId @institution_order.institution_id
  json.orderDate @institution_order.order_date.strftime("%-m/%-d/%Y")
  json.number @institution_order.number
  json.billingName @institution_order.billing_name
  json.billingAddress1 @institution_order.billing_address_1
  json.billingAddress2 @institution_order.billing_address_2
  json.billingCity @institution_order.billing_city
  json.billingState @institution_order.billing_state
  json.billingZip @institution_order.billing_zip
  json.billingCountry @institution_order.billing_country
  json.shippingName @institution_order.shipping_name
  json.shippingAddress1 @institution_order.shipping_address_1
  json.shippingAddress2 @institution_order.shipping_address_2
  json.shippingCity @institution_order.shipping_city
  json.shippingState @institution_order.shipping_state
  json.shippingZip @institution_order.shipping_zip
  json.shippingCountry @institution_order.shipping_country
  json.subtotal dollarify(number_with_precision(@institution_order.subtotal, precision: 2, delimiter: ','))
  json.shippingFee dollarify(number_with_precision(@institution_order.shipping_fee, precision: 2, delimiter: ','))
  json.total dollarify(number_with_precision(@institution_order.total, precision: 2, delimiter: ','))
  json.materialsSent @institution_order.materials_sent ? @institution_order.materials_sent.strftime("%-m/%-d/%Y") : ''
  json.trackingNumber @institution_order.tracking_number
  json.internalNotes @institution_order.internal_notes
  json.invoiceNotes @institution_order.invoice_notes
  json.customerEmail @customer_email
end
if @invoice
  json.invoice do
    json.id @invoice.id
    json.number @invoice.number
    json.sentDate @invoice.sent_date.strftime("%-m/%-d/%Y")
  end
else
  json.invoice nil
end
json.institutions @institutions do |institution|
  json.id institution.id
  json.label institution.label
end
json.institutionOrderFilms @institution_order_films do |institution_order_film|
  json.id institution_order_film.id
  json.filmTitle institution_order_film.film.title
  json.licensedRights institution_order_film.licensed_rights_display_text
  json.price dollarify(number_with_precision(institution_order_film.price, precision: 2, delimiter: ','))
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
