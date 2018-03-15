json.quotes @quotes do |quote|
  json.id quote.id
  json.filmId quote.film_id
  json.text quote.text
  json.author quote.author || ""
  json.publication quote.publication || ""
end
