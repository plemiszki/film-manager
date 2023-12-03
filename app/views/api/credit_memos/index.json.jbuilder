json.creditMemos @credit_memos do |credit_memo|
  json.id credit_memo.id
  json.sentDate credit_memo.sent_date.strftime("%-m/%-d/%Y")
  json.number credit_memo.number
  json.returnNumber credit_memo.return_number
  json.customer credit_memo.customer.name
end
json.pageNumbers @page_numbers
json.morePages @more_pages
