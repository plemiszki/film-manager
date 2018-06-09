json.filmRights @film_rights do |film_right|
  json.id film_right.id
  json.film film_right.film.title
  json.territoryId film_right.territory_id.to_s
  json.rightId film_right.right_id.to_s
  json.startDate film_right.start_date ? film_right.start_date.strftime("%-m/%-d/%y") : ''
  json.endDate film_right.end_date ? film_right.end_date.strftime("%-m/%-d/%y") : ''
  json.exclusive film_right.exclusive ? 'Yes' : 'No'
end
json.territories @territories do |territory|
  json.id territory.id.to_s
  json.name territory.name
end
json.rights @rights do |right|
  json.id right.id.to_s
  json.name right.name
end
