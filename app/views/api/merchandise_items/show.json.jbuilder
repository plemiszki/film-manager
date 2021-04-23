json.merchandiseItem do
  json.id @merchandise_item.id
  json.name @merchandise_item.name
  json.merchandiseTypeId @merchandise_item.merchandise_type_id.to_s
  json.price dollarify(number_with_precision(@merchandise_item.price, precision: 2, delimiter: ','))
  json.size @merchandise_item.size
  json.inventory @merchandise_item.inventory.to_s
  json.filmId @merchandise_item.film_id || ""
  json.description @merchandise_item.description
end
json.merchandiseTypes @merchandise_types do |merchandise_type|
  json.id merchandise_type.id
  json.name merchandise_type.name
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
