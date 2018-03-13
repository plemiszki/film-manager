json.filmGenres @film_genres do |film_genre|
  json.id film_genre.id
  json.genre film_genre.genre.name
end
json.genres @genres do |genre|
  json.id genre.id
  json.name genre.name
end
