json.creditMemos @credit_memos do |credit_memo|
  json.id credit_memo.id
  json.sentDate credit_memo.sent_date.strftime("%-m/%-d/%y")
  json.number credit_memo.number
  json.returnNumber credit_memo.return_number
  json.customerName credit_memo.customer.name
end
