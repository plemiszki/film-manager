json.items @items do |return_item|
  json.id return_item[:id]
  json.label return_item[:label]
  json.itemId return_item[:item_id]
  json.qty return_item[:qty]
  json.order return_item[:order]
end
json.otherItems @other_items do |item|
  json.id item['id']
  json.label item[:label]
  json.itemType item[:item_type]
end
