json.invoices @invoices do |invoice|
  json.id invoice.id
  json.sentDate invoice.sent_date
  json.number invoice.number
  json.poNumber invoice.po_number
  json.billingName invoice.billing_name
  json.billingAddress1 invoice.billing_address1
  json.billingAddress2 invoice.billing_address2
  json.billingCity invoice.billing_city
  json.billingState invoice.billing_state
  json.billingZip invoice.billing_zip
  json.billingCountry invoice.billing_country
  json.shippingName invoice.shipping_name
  json.shippingAddress1 invoice.shipping_address1
  json.shippingAddress2 invoice.shipping_address2
  json.shippingCity invoice.shipping_city
  json.shippingState invoice.shipping_state
  json.shippingZip invoice.shipping_zip
  json.shippingCountry invoice.shipping_country
  json.subTotal dollarify(invoice.sub_total.to_s)
  json.shipFee dollarify(invoice.ship_fee.to_s)
  json.total dollarify(invoice.total.to_s)
  json.notes invoice.notes
end
json.rows @rows do |row|
  json.label row.item_label
  json.price dollarify(row.unit_price.to_s)
  json.qty row.item_qty
  json.totalPrice dollarify(row.total_price.to_s)
end
