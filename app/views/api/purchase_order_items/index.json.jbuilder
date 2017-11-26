json.items @items do |purchase_order_item|
  json.id purchase_order_item[:id]
  json.label purchase_order_item[:label]
  json.itemId purchase_order_item[:item_id]
  json.qty purchase_order_item[:qty]
  json.stock purchase_order_item[:stock]
  json.order purchase_order_item[:order]
  json.price dollarify(get_price(purchase_order_item[:item_id], purchase_order_item[:item_type], @selected_dvd_customer).to_s)
end
json.otherItems @other_items do |item|
  json.id item['id']
  json.label item[:label]
  json.itemType item[:item_type]
end
