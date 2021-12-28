json.invoice do
  json.id @invoice.id
  json.invoiceType @invoice.invoice_type
  json.film (@invoice.booking_id ? @invoice.booking.film.title : '')
  json.venue (@invoice.booking_id ? @invoice.booking.venue.label : '')
  json.sentDate @invoice.sent_date
  json.number @invoice.number
  json.poNumber @invoice.po_number
  json.billingName @invoice.billing_name
  json.billingAddress1 @invoice.billing_address1
  json.billingAddress2 @invoice.billing_address2
  json.billingCity @invoice.billing_city
  json.billingState @invoice.billing_state
  json.billingZip @invoice.billing_zip
  json.billingCountry @invoice.billing_country
  json.shippingName @invoice.shipping_name
  json.shippingAddress1 @invoice.shipping_address1
  json.shippingAddress2 @invoice.shipping_address2
  json.shippingCity @invoice.shipping_city
  json.shippingState @invoice.shipping_state
  json.shippingZip @invoice.shipping_zip
  json.shippingCountry @invoice.shipping_country
  json.subTotal dollarify(number_with_precision(@invoice.sub_total.to_s, precision: 2, delimiter: ','))
  json.total dollarify(number_with_precision(@invoice.total_minus_payments.to_s, precision: 2, delimiter: ','))
  json.notes @invoice.notes
end
json.rows @rows do |row|
  json.label row.item_label
  json.price dollarify(number_with_precision(row.unit_price.to_s, precision: 2, delimiter: ','))
  json.qty row.item_qty
  json.totalPrice dollarify(number_with_precision(row.total_price.to_s, precision: 2, delimiter: ','))
end
json.payments @payments do |payment|
  json.date payment.date.strftime("%-m/%-d/%y")
  json.amount dollarify(number_with_precision((payment.amount * -1).to_s, precision: 2, delimiter: ','))
  json.notes payment.notes
end
