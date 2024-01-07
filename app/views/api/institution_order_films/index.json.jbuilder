json.institutionOrderFilms @institution_order_films do |institution_order_film|
  json.id institution_order_film.id
  json.filmTitle institution_order_film.film.title
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
