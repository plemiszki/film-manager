json.alternateAudios @alternate_audios do |alternate_audio|
  json.id alternate_audio.id
  json.languageName alternate_audio.language.name
end
