json.array! @films do |film|
  json.id film.id
  json.title film.title
  json.endDate film.end_date ? film.end_date.strftime("%-m/%-d/%y") : ""
end
