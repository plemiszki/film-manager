json.amazonGenreFilms @amazon_genre_films do |amazon_genre_film|
  json.id amazon_genre_film.id
  json.code amazon_genre_film.amazon_genre.code
end
json.amazonGenres @amazon_genres do |amazon_genre|
  json.id amazon_genre.id
  json.code amazon_genre.code
end
