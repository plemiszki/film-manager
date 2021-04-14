json.subRight do
  json.id @sub_right.id
  json.territoryId @sub_right.territory_id.to_s
  json.rightId @sub_right.right_id.to_s
  json.filmId @sub_right.film_id.to_s
  json.startDate @sub_right.start_date ? @sub_right.start_date.strftime("%-m/%-d/%y") : ''
  json.endDate @sub_right.end_date ? @sub_right.end_date.strftime("%-m/%-d/%y") : ''
  json.exclusive @sub_right.exclusive ? 'Yes' : 'No'
end
