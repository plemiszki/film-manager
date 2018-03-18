json.actors @actors do |actor|
  json.id actor.id
  json.filmId actor.film_id
  json.firstName actor.first_name
  json.lastName actor.last_name
end
