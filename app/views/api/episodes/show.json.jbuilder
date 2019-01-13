json.episode do
  json.id @episode.id
  json.title @episode.title
  json.seasonNumber @episode.season_number.to_s
  json.episodeNumber @episode.episode_number.to_s
  json.synopsis @episode.synopsis
  json.length @episode.length.to_s
end
