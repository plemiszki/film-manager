json.digitalRetailer do
  json.id @digital_retailer.id
  json.name @digital_retailer.name
  json.billingName @digital_retailer.billing_name
  json.billingAddress1 @digital_retailer.billing_address1
  json.billingAddress2 @digital_retailer.billing_address2
  json.billingCity @digital_retailer.billing_city
  json.billingState @digital_retailer.billing_state
  json.billingZip @digital_retailer.billing_zip
  json.billingCountry @digital_retailer.billing_country
end
