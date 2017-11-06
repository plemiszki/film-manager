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
  json.customer shipping_address.customer_id > 0 ? DvdCustomer.find(shipping_address.customer_id).name : "(No Customer)"
end
