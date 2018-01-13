json.array! @venues do |venue|
  json.id venue.id
  json.label venue.label
  json.venueType venue.venue_type
end
