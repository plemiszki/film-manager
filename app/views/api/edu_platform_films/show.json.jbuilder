json.eduPlatforms @edu_platforms do |edu_platform|
  json.id edu_platform.id
  json.name edu_platform.name
end
json.eduPlatformFilm do
  json.id @edu_platform_film.id
  json.filmId @edu_platform_film.film_id
  json.eduPlatformId @edu_platform_film.edu_platform_id
  json.url @edu_platform_film.url
end
