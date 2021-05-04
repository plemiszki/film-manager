json.digitalRetailers @digital_retailers do |digital_retailer|
  json.id digital_retailer.id
  json.name digital_retailer.name
end
json.digitalRetailerFilm do
  json.id @digital_retailer_film.id
  json.filmId @digital_retailer_film.film_id
  json.digitalRetailerId @digital_retailer_film.digital_retailer_id
  json.url @digital_retailer_film.url
end
