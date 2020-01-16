json.alternateSubs @alternate_subs do |alternate_sub|
  json.id alternate_sub.id
  json.languageName alternate_sub.language.name
end
json.subtitleLanguages @subtitle_languages do |language|
  json.id language.id
  json.name language.name
end
