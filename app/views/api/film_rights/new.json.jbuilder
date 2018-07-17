json.territories @territories do |territory|
  json.id territory.id.to_s
  json.name territory.name
end
json.rights @rights do |right|
  json.id right.id.to_s
  json.name right.name
end
json.films @films do |film|
  json.id film.id.to_s
  json.title film.title
end
