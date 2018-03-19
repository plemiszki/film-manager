json.array!(@films) do |film|
  json.id film.id
  json.title film.title
  json.active film.active
  json.short_film film.short_film
  json.label film.label.name
  json.year film.year
  json.length film.length
  json.synopsis film.synopsis
  json.short_synopsis film.short_synopsis
  json.logline film.logline
  json.vod_synopsis film.vod_synopsis
  json.institutional_synopsis film.institutional_synopsis
  json.vimeo_trailer film.vimeo_trailer
  json.youtube_trailer film.youtube_trailer
  json.prores_trailer film.prores_trailer
  json.standalone_site film.standalone_site
  json.facebook_link film.facebook_link
  json.twitter_link film.twitter_link
  json.instagram_link film.instagram_link
  json.directors film.directors do |director|
    json.id director.id
    json.first_name director.first_name
    json.last_name director.last_name
  end
  json.cast film.actors do |actor|
    json.id actor.id
    json.first_name actor.first_name
    json.last_name actor.last_name
  end
  json.laurels film.laurels do |laurel|
    json.id laurel.id
    json.order laurel.order
    json.result laurel.result
    json.award_name laurel.award_name
    json.festival laurel.festival
  end
  json.quotes film.quotes do |quote|
    json.id quote.id
    json.order quote.order
    json.text quote.text
    json.author quote.author
    json.publication quote.publication
  end
  json.related_films film.related_films do |related_film|
    json.id related_film.id
    json.order related_film.order
    json.other_film_id related_film.other_film_id
  end
end
