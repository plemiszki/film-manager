json.amazonGenreFilms @amazon_genre_films do |amazon_genre_film|
  json.id amazon_genre_film.id
  json.name amazon_genre_film.amazon_genre.name
end
json.amazonGenres @amazon_genres do |amazon_genre|
  json.id amazon_genre.id
  json.name amazon_genre.name
end
