json.eduPlatformFilms @edu_platform_films do |edu_platform_film|
  json.id edu_platform_film.id
  json.eduPlatformId edu_platform_film.edu_platform_id.to_s
  json.name edu_platform_film.edu_platform.name
  json.url edu_platform_film.url
  json.filmId edu_platform_film.film_id
end
json.eduPlatforms @edu_platforms do |edu_platform|
  json.id edu_platform.id
  json.name edu_platform.name
end
