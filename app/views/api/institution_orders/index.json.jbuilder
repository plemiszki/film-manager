json.institutionOrders @institution_orders do |institution_order|
  json.id institution_order.id
  json.orderDate institution_order.order_date.strftime("%-m/%-d/%Y")
  json.number institution_order.number
  json.customer institution_order.customer.label
end
