json.alias do
  json.id @alias.id
  json.text @alias.text
  json.filmId @alias.film_id.to_s
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
