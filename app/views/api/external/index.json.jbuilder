json.films @films do |film|
  json.id film.id
  json.title film.title
  json.release_year film.year
  json.object_type 'movie'
  json.description film.short_synopsis
  json.imdb_id film.imdb_id
  json.runtime film.length
  json.offers (['US'] + (film.film_rights.select do |fr|
    (fr.right_id == 5 || fr.right_id == 16) && (fr.territory_id == 3 || fr.territory_id == 4)
  end.pluck(:territory_id).uniq == [3, 4] ? ['CA'] : [])) do |country_iso|
    json.quality "hd"
    json.type "subscription"
    json.country_iso country_iso
  end
end
