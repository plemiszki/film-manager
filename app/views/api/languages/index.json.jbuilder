json.languages @languages do |language|
  json.id language.id
  json.name language.name
  json.prime_code language.prime_code
end
