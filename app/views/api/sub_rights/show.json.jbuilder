json.subRight do
  json.id @sub_right.id
  json.territoryId @sub_right.territory_id
  json.rightId @sub_right.right_id
  json.filmId @sub_right.film_id
  json.startDate @sub_right.start_date ? @sub_right.start_date.strftime("%-m/%-d/%Y") : ''
  json.endDate @sub_right.end_date ? @sub_right.end_date.strftime("%-m/%-d/%Y") : ''
  json.exclusive @sub_right.exclusive
  json.sublicensorId @sub_right.sublicensor_id
end
json.territories @territories do |territory|
  json.id territory.id
  json.name territory.name
end
json.rights @rights do |right|
  json.id right.id
  json.name right.name
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
