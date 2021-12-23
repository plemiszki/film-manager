json.booker do
  json.id @booker.id
  json.name @booker.name
  json.email @booker.email
  json.phone @booker.phone
end
json.bookerVenues @booker_venues do |booker_venue|
  json.id booker_venue.id
  json.venue booker_venue.venue.label
end
json.venues @venues do |venue|
  json.id venue.id
  json.name venue.label
end
