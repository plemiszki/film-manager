json.films @films do |film|
  json.id film.id
  json.title film.title
end
json.merchandiseTypes @merchandise_types do |merchandise_type|
  json.id merchandise_type.id
  json.name merchandise_type.name
end
