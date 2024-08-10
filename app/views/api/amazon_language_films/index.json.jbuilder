json.amazonLanguageFilms @amazon_language_films do |amazon_language_film|
  json.id amazon_language_film.id
  json.name amazon_language_film.amazon_language.name
end
json.amazonLanguages @amazon_languages do |amazon_language|
  json.id amazon_language.id
  json.name amazon_language.name
end
json.videoFilenameExport @film.xml_video_filename_default
