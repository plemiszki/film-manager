json.quote do
  json.id @quote.id
  json.text @quote.text
  json.author @quote.author || ""
  json.publication @quote.publication || ""
  json.filmId @quote.film_id
end
