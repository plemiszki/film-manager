json.shippingAddresses @shipping_addresses do |shipping_address|
  json.id shipping_address.id
  json.label shipping_address.label
end
json.customers @dvd_customers do |customer|
  json.id customer.id
  json.name customer.name
end
