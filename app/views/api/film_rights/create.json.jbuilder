json.filmRights @film_rights do |film_right|
  json.id film_right.id
  json.name film_right.right.name
  json.order film_right.right.order
  json.territory film_right.territory.name
  json.startDate film_right.start_date ? film_right.start_date.strftime("%-m/%-d/%y") : ''
  json.endDate film_right.end_date ? film_right.end_date.strftime("%-m/%-d/%y") : ''
  json.exclusive film_right.exclusive ? 'Yes' : 'No'
end
