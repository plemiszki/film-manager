json.in_theaters(@in_theaters) do |film|
  json.order film.order
  json.film_id film.film.id
  json.film_title film.film.title
  json.bookings film.film.bookings.where.not(booking_type: "Non-Theatrical").includes(:venue) do |booking|
    json.venue booking.venue.label
    json.venue_website booking.venue.website
    json.city booking.billing_city
    json.state booking.billing_state
    json.country booking.billing_country
    json.startDate booking.start_date.strftime("%-m/%-d/%y")
    json.endDate booking.end_date.strftime("%-m/%-d/%y")
  end
end
json.coming_soon(@coming_soon) do |film|
  json.order film.order
  json.film_id film.film.id
  json.film_title film.film.title
  json.bookings film.film.bookings.where.not(booking_type: "Non-Theatrical").includes(:venue) do |booking|
    json.venue booking.venue.label
    json.venue_website booking.venue.website
    json.city booking.billing_city
    json.state booking.billing_state
    json.country booking.billing_country
    json.startDate booking.start_date.strftime("%-m/%-d/%y")
    json.endDate booking.end_date.strftime("%-m/%-d/%y")
  end
end
json.repertory(@repertory) do |film|
  json.order film.order
  json.film_id film.film.id
  json.film_title film.film.title
  json.bookings film.film.bookings.where.not(booking_type: "Non-Theatrical").includes(:venue) do |booking|
    json.venue booking.venue.label
    json.venue_website booking.venue.website
    json.city booking.billing_city
    json.state booking.billing_state
    json.country booking.billing_country
    json.startDate booking.start_date.strftime("%-m/%-d/%y")
    json.endDate booking.end_date.strftime("%-m/%-d/%y")
  end
end
