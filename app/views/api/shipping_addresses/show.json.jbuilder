json.shippingAddress do
  json.id @shipping_address.id
  json.label @shipping_address.label
  json.name @shipping_address.name
  json.address1 @shipping_address.address1
  json.address2 @shipping_address.address2
  json.city @shipping_address.city
  json.state @shipping_address.state
  json.zip @shipping_address.zip
  json.country @shipping_address.country
  json.customerId @shipping_address.customer_id.to_s
end
json.dvdCustomers @dvd_customers do |dvd_customer|
  json.id dvd_customer.id
  json.name dvd_customer.name
end
