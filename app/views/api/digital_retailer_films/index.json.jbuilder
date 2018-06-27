json.digitalRetailerFilms @digital_retailer_films do |digital_retailer_film|
  json.id digital_retailer_film.id
  json.digitalRetailerId digital_retailer_film.digital_retailer_id.to_s
  json.name digital_retailer_film.digital_retailer.name
  json.url digital_retailer_film.url
  json.filmId digital_retailer_film.film_id
end
json.digitalRetailers @digital_retailers do |digital_retailer|
  json.id digital_retailer.id
  json.name digital_retailer.name
end
