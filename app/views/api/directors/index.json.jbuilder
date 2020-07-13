json.directors @directors do |director|
  json.id director.id
  json.filmId director.film_id
  json.firstName director.first_name
  json.lastName director.last_name
  json.order director.order
end
