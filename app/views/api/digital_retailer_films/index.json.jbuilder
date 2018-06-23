json.digitalRetailerFilms @digital_retailer_films do |digital_retailer_film|
  json.id digital_retailer_film.id
  json.name digital_retailer_film.digital_retailer.name
  json.url digital_retailer_film.url
end
json.digitalRetailers @digital_retailers do |digital_retailer|
  json.id digital_retailer.id
  json.name digital_retailer.name
end
