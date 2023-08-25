json.genres @genres do |genre|
  json.id genre.id
  json.name genre.name
  json.primeCode genre.prime_code
end
