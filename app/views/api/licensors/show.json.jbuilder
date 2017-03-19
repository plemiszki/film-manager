json.array! @licensors do |licensor|
  json.id licensor.id
  json.name licensor.name
  json.email licensor.email || ""
  json.address licensor.address || ""
end
