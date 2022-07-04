json.return do
  json.id @return.id
  json.number @return.number
  json.customerId @return.customer_id.to_s
  json.date @return.date.strftime("%-m/%-d/%y")
  json.creditMemoId @return.credit_memo.try(:id) || ''
  json.creditMemoNumber @return.credit_memo.try(:number) || ''
  json.creditMemoDate @return.credit_memo.try(:sent_date).try(:strftime, "%-m/%-d/%y") || ''
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
