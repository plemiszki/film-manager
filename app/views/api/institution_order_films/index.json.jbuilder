json.institutionalOrderFilms @institutional_order_films do |institutional_order_film|
  json.id institutional_order_film.id
  json.filmTitle institutional_order_film.film.title
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
