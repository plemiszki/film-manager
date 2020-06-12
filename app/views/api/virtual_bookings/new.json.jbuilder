json.films @films do |film|
  json.id film.id
  json.title film.title
end
json.venues @venues do |venue|
  json.id venue.id
  json.label venue.label
end
