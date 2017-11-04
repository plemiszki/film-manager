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
  json.orderDate purchase_order.order_date
  json.shipDate purchase_order.ship_date || ""
end
json.dvdCustomers @dvd_customers do |dvd_customer|
  json.id dvd_customer.id
  json.name dvd_customer.name
end
