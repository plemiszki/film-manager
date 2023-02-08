json.licensor do
  json.id @licensor.id
  json.name @licensor.name
  json.email @licensor.email || ""
  json.address @licensor.address || ""
end
json.films @films do |film|
  json.id film.id
  json.title film.title
  json.daysStatementDue film.days_statement_due
end
