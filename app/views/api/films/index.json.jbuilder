json.films @films do |film|
  json.id film.id
  json.title film.title
  json.endDate film.end_date ? film.end_date.strftime("%-m/%-d/%y") : ""
  json.alternateLengths film.alternate_lengths.map { |length| length.length }
  json.alternateAudios film.alternate_audios.map { |audio| audio.language.name }
  json.alternateSubs film.alternate_subs.map { |sub| sub.language.name }
end
json.alternateLengths @alternate_lengths
json.alternateAudios @alternate_audios
json.alternateSubs @alternate_subs
