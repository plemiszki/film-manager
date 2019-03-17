json.array!(@merchandise_items) do |merchandise_item|
  json.id merchandise_item.id
  json.name merchandise_item.name
  json.type merchandise_item.merchandise_type.name
  json.description merchandise_item.description
  json.size merchandise_item.size
  json.price merchandise_item.price
  json.inventory merchandise_item.inventory
  json.filmId merchandise_item.film_id || ""
end
