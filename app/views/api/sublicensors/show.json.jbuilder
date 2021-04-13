json.sublicensor do
  json.id @sublicensor.id
  json.name @sublicensor.name
  json.email @sublicensor.email || ""
  json.phone @sublicensor.phone || ""
  json.contactName @sublicensor.contact_name || ""
  json.w8 @sublicensor.w8
end
json.rights @rights do |right|
  json.id right.id
  json.name right.right.name
  json.order right.right.order
  json.territory right.territory.name
  json.startDate right.start_date ? right.start_date.strftime("%-m/%-d/%y") : ''
  json.endDate right.end_date ? right.end_date.strftime("%-m/%-d/%y") : ''
  json.exclusive right.exclusive ? 'Yes' : 'No'
  json.film right.film.title
end
