json.array! @reports do |report|
  json.id report.id
  json.title report.film.title
end
