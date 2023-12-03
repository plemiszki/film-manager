json.subRights @sub_rights do |right|
  json.id right.id
  json.right right.right.name
  json.order right.right.order
  json.territory right.territory.name
  json.startDate right.start_date ? right.start_date.strftime("%-m/%-d/%Y") : ''
  json.endDate right.end_date ? right.end_date.strftime("%-m/%-d/%Y") : ''
  json.exclusive right.exclusive ? 'Yes' : 'No'
  json.film right.film.title
end
json.pageNumbers @page_numbers
json.morePages @more_pages
