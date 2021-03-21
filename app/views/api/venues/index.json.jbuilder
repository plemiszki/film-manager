json.venues @venues do |venue|
  json.id venue.id
  json.label venue.label
  json.type venue.venue_type
  json.city venue.shipping_city
  json.state venue.shipping_state
end
json.pageNumbers @page_numbers
json.morePages @more_pages
