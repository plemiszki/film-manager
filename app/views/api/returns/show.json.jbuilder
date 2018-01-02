json.returns @returns do |r|
  json.id r.id
  json.number r.number
  json.customerId r.customer_id.to_s
  json.date r.date
end
json.customers @dvd_customers do |customer|
  json.id customer.id
  json.name customer.name
end
json.items @items do |return_item|
  json.id return_item[:id]
  json.label return_item[:label]
  json.itemId return_item[:item_id]
  json.qty return_item[:qty]
  json.order return_item[:order]
  json.amount dollarify(return_item[:amount].to_s)
end
json.otherItems @other_items do |item|
  json.id item['id']
  json.label item[:label]
  json.itemType item[:item_type]
end
