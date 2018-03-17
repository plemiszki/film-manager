json.relatedFilms @related_films do |related_film|
  json.id related_film.id
  json.filmId related_film.film_id
  json.title related_film.other_film.title
  json.order related_film.order
end
json.otherFilms @other_films do |film|
  json.id film.id
  json.title film.title
end
