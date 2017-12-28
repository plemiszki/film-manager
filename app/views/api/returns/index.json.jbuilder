json.returns @returns do |r|
  json.id r.id
  json.number r.number
  json.date r.date
  json.customer r.customer.name
end
