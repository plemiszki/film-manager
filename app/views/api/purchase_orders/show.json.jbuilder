json.purchaseOrders @purchase_orders do |purchase_order|
  json.id purchase_order.id
  json.number purchase_order.number
  json.customerId purchase_order.customer_id.to_s
  json.name purchase_order.name
  json.address1 purchase_order.address1
  json.address2 purchase_order.address2
  json.city purchase_order.city
  json.state purchase_order.state
  json.zip purchase_order.zip
  json.country purchase_order.country
  json.orderDate purchase_order.order_date || ""
  json.shipDate purchase_order.ship_date || ""
end
json.dvdCustomers @dvd_customers do |dvd_customer|
  json.id dvd_customer.id
  json.name dvd_customer.name
end
json.shippingAddresses @shipping_addresses do |shipping_address|
  json.id shipping_address.id
  json.label shipping_address.label
  json.name shipping_address.name
  json.address1 shipping_address.address1
  json.address2 shipping_address.address2
  json.city shipping_address.city
  json.state shipping_address.state
  json.zip shipping_address.zip
  json.country shipping_address.country
  json.customerId shipping_address.customer_id
end