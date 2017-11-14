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
  json.sendInvoice purchase_order.send_invoice
end
json.dvdCustomers @dvd_customers do |dvd_customer|
  json.id dvd_customer.id
  json.name dvd_customer.name
  json.consignment dvd_customer.consignment
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
json.items @items do |purchase_order_item|
  json.id purchase_order_item[:id]
  json.label purchase_order_item[:label]
  json.itemId purchase_order_item[:item_id]
  json.qty purchase_order_item[:qty]
  json.stock purchase_order_item[:stock]
  json.order purchase_order_item[:order]
end
json.otherItems @other_items do |item|
  json.id item['id']
  json.label item[:label]
  json.itemType item[:item_type]
end
