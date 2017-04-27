json.array! @reports do |report|
  json.id report.id
  json.title report.film.title
  json.days report.film.days_statement_due
end
