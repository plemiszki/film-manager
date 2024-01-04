json.institution do
  json.id @institution.id
  json.label @institution.label
  json.sageId @institution.sage_id
  json.contactName @institution.contact_name
  json.email @institution.email
  json.phone @institution.phone
  json.billingName @institution.billing_name
  json.billingAddress1 @institution.billing_address_1
  json.billingAddress2 @institution.billing_address_2
  json.billingCity @institution.billing_city
  json.billingState @institution.billing_state
  json.billingZip @institution.billing_zip
  json.billingCountry @institution.billing_country
  json.shippingName @institution.shipping_name
  json.shippingAddress1 @institution.shipping_address_1
  json.shippingAddress2 @institution.shipping_address_2
  json.shippingCity @institution.shipping_city
  json.shippingState @institution.shipping_state
  json.shippingZip @institution.shipping_zip
  json.shippingCountry @institution.shipping_country
  json.notes @institution.notes
end
json.orders @orders do |order|
  json.id order.id
  json.orderDate order.order_date.strftime("%-m/%-d/%Y")
  json.number order.number
end
