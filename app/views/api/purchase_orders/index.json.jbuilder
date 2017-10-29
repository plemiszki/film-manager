json.purchaseOrders @purchase_orders do |purchase_order|
  json.id purchase_order.id
  json.number purchase_order.number
  json.shipDate purchase_order.ship_date ? purchase_order.ship_date : "(Not Sent)"
  json.customer purchase_order.customer ? purchase_order.customer.name : ""
  json.units 0
end
json.needToUpdate @jobs.empty? ? true : DateTime.parse(@jobs.last.job_id).to_date.past?
