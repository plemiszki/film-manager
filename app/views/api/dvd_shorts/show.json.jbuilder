json.shorts @dvd_shorts do |dvd_short|
  json.id dvd_short.id
  json.title dvd_short.film.title
  json.filmId dvd_short.film.id
end
json.otherShorts @other_shorts do |short|
  json.id short.id
  json.title short.title
end
