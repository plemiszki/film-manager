json.creditMemo do
  json.id @credit_memo.id
  json.sentDate @credit_memo.sent_date.strftime("%-m/%-d/%y")
  json.number @credit_memo.number
  json.returnNumber @credit_memo.return_number
  json.billingName @credit_memo.billing_name
  json.billingAddress1 @credit_memo.billing_address1
  json.billingAddress2 @credit_memo.billing_address2
  json.billingCity @credit_memo.billing_city
  json.billingState @credit_memo.billing_state
  json.billingZip @credit_memo.billing_zip
  json.billingCountry @credit_memo.billing_country
  json.total dollarify(number_with_precision(@credit_memo.total, precision: 2, delimiter: ','))
  json.customerName @credit_memo.customer.name
end
json.rows @rows do |row|
  json.label row.item_label
  json.price dollarify(number_with_precision(row.unit_price.to_s, precision: 2, delimiter: ','))
  json.qty row.item_qty
  json.totalPrice dollarify(number_with_precision(row.total_price.to_s, precision: 2, delimiter: ','))
end
