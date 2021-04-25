json.returns @returns do |r|
  json.id r.id
  json.number r.number
  json.date r.date
  json.customer r.customer.name
  json.units r.return_items.reduce(0) { |total, item| total += item.qty }
end
json.pageNumbers @page_numbers
json.morePages @more_pages
