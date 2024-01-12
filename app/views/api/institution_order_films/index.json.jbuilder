json.institutionOrderFilms @institution_order_films do |institution_order_film|
  json.id institution_order_film.id
  json.filmTitle institution_order_film.film.title
  json.licensedRights institution_order_film.licensed_rights_display_text
  json.price dollarify(number_with_precision(institution_order_film.price, precision: 2, delimiter: ','))
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
