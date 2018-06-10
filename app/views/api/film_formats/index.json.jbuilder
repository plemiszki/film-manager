json.filmFormats @film_formats do |film_format|
  json.id film_format.id
  json.format film_format.format.name
end
json.formats @formats do |format|
  json.id format.id
  json.name format.name
end
