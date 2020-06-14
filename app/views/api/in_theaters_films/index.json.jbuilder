json.films @films do |film|
  json.id film.id
  json.title film.title
end
json.nonVirtualFilms @non_virtual_films do |film|
  json.id film.id
  json.title film.title
end
json.inTheaters @in_theaters do |film|
  json.id film.id
  json.film film.film.title
  json.section film.section
  json.order film.order
end
json.comingSoon @coming_soon do |film|
  json.id film.id
  json.film film.film.title
  json.section film.section
  json.order film.order
end
json.repertory @repertory do |film|
  json.id film.id
  json.film film.film.title
  json.section film.section
  json.order film.order
end
json.virtual @virtual do |film|
  json.id film.id
  json.film film.film.title
  json.section film.section
  json.order film.order
end
