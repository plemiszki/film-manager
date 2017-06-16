json.reports @reports do |report|
  json.id report.id
  json.title report.film.title
  json.licensor (report.film.licensor ? report.film.licensor.name : '(None)')
  json.days report.film.days_statement_due
  json.dateSent report.date_sent
end
json.errors @errors
