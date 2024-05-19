json.licensor do
  json.id @licensor.id
  json.name @licensor.name
  json.email @licensor.email || ""
  json.address @licensor.address || ""
  json.sageId @licensor.sage_id
end
json.films @films do |film|
  json.id film.id
  json.title film.title
  json.daysStatementDue film.days_statement_due
end
