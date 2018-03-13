json.filmCountries @film_countries do |film_country|
  json.id film_country.id
  json.country film_country.country.name
end
json.countries @countries do |country|
  json.id country.id
  json.name country.name
end
