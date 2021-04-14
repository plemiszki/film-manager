json.territories @territories do |territory|
  json.id territory.id
  json.name territory.name
end
json.rights @rights do |right|
  json.id right.id
  json.name right.name
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
