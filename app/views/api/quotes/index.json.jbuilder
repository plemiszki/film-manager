json.quotes @quotes do |quote|
  json.id quote.id
  json.text quote.text
  json.author quote.author || ""
  json.publication quote.publication || ""
  json.filmId quote.film_id
  json.order quote.order
end
