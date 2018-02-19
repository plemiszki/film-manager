json.bookings @bookings do |booking|
  json.id booking.id
  json.startDate booking.start_date.strftime("%-m/%-d/%y")
  json.film booking.film.title
  json.venue booking.venue.label
  json.dateAdded booking.date_added.strftime("%-m/%-d/%y")
end
json.films @films do |film|
  json.id film.id
  json.title film.title
end
json.venues @venues do |venue|
  json.id venue.id
  json.label venue.label
end
