json.films @films do |film|
  json.title film.title
  json.imdb_id film.imdb_id
  json.release_year film.year
  json.runtime film.length
  json.synopsis film.synopsis
  json.short_synopsis film.short_synopsis
  json.logline film.logline
  json.directors film.directors do |director|
    json.first_name director.first_name
    json.last_name director.last_name
  end
  json.cast film.actors do |actor|
    json.first_name actor.first_name
    json.last_name actor.last_name
  end
  json.countries film.film_countries do |film_country|
    json.name film_country.country.name
  end
  json.languages film.film_languages do |film_language|
    json.name film_language.language.name
  end
end
