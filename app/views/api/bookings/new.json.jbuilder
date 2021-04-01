json.films @films do |film|
  json.id film.id
  json.title film.title
end
json.venues @venues do |venue|
  json.id venue.id
  json.label venue.label
end
json.users @users do |user|
  json.id user.id
  json.name user.name
  json.booker user.booker
  json.inactive user.inactive
end
json.formats @formats do |format|
  json.id format.id
  json.name format.name
  json.active format.active
end
