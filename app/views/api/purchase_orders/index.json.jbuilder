json.purchaseOrders @purchase_orders do |purchase_order|
  json.id purchase_order.id
  json.number purchase_order.number
  json.shipDate purchase_order.ship_date ? purchase_order.ship_date : "(Not Sent)"
  json.orderDate purchase_order.order_date
  json.customer purchase_order.customer ? purchase_order.customer.name : ""
  json.units purchase_order.purchase_order_items.inject(0) { |accum, item| accum + item.qty }
  json.invoice purchase_order.invoice ? purchase_order.invoice.number : ""
  json.salesOrder purchase_order.source_doc || ""
end
json.pageNumbers @page_numbers
json.morePages @more_pages
