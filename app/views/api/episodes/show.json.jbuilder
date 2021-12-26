json.episode do
  json.id @episode.id
  json.title @episode.title
  json.seasonNumber @episode.season_number.to_s
  json.episodeNumber @episode.episode_number.to_s
  json.synopsis @episode.synopsis
  json.length @episode.length.to_s
  json.filmId @episode.film_id.to_s
end
json.actors @actors do |actor|
  json.id actor.id
  json.firstName actor.first_name
  json.lastName actor.last_name
  json.order actor.order
end
