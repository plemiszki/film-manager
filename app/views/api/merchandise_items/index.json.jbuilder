json.merchandiseItems @merchandise_items do |merchandise_item|
  json.id merchandise_item.id
  json.name merchandise_item.name
  json.type merchandise_item.merchandise_type.name
  json.size merchandise_item.size
  json.price dollarify(number_with_precision(merchandise_item.price, precision: 2, delimiter: ','))
end
json.merchandiseTypes @merchandise_types do |merchandise_type|
  json.id merchandise_type.id
  json.name merchandise_type.name
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
