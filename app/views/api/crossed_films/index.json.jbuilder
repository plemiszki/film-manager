json.crossedFilms @crossed_films do |crossedFilm|
  json.id crossedFilm.id
  json.title crossedFilm.crossed_film.title
end
json.otherCrossedFilms @other_crossed_films do |film|
  json.id film.id
  json.title film.title
end
