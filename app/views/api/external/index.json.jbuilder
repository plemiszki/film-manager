json.films @films do |film|
  json.id film.id
  json.title film.title
  json.release_year film.year
  json.object_type 'movie'
  json.description film.short_synopsis
  json.imdb_id film.imdb_id
  json.runtime film.length
  json.crew_members film.directors.each do |director|
    json.role 'director'
    json.full_name "#{director.first_name} #{director.last_name}"
  end
  if film.artwork_url.present?
    json.images do
      json.image_type 'poster'
      json.width 0
      json.height 0
      json.language 'en'
      json.url film.artwork_url
    end
  end
  json.offers (['US'] + (film.film_rights.select do |fr|
    (fr.right_id == 5 || fr.right_id == 16) && (fr.territory_id == 3 || fr.territory_id == 4)
  end.pluck(:territory_id).uniq == [3, 4] ? ['CA'] : [])) do |country_iso|
    json.quality 'hd'
    json.type 'subscription'
    json.country_iso country_iso
    json.web_url film.fm_plus_url
    json.audio_languages film.languages.map { |language| language.iso_code }.compact
    json.subtitle_languages film.languages.pluck(:name) == ['English'] ? [] : ['en']
  end
end
