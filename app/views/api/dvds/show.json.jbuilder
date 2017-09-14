json.dvds @dvds do |dvd|
  json.id dvd.id
  json.dvdTypeId dvd.dvd_type_id.to_s
  json.featureFilmId dvd.feature_film_id
  json.title dvd.feature.title
  json.price '$' + number_with_precision(dvd.price, precision: 2, delimiter: ',')
  json.upc dvd.upc
  json.stock dvd.stock
  json.repressing dvd.repressing
  json.soundConfig dvd.sound_config
  json.specialFeatures dvd.special_features
  json.discs dvd.discs
  json.unitsShipped dvd.units_shipped
  json.firstShipment dvd.first_shipment || ""
  json.preBookDate dvd.pre_book_date || ""
  json.retailDate dvd.retail_date || ""
end
json.dvdTypes @dvd_types
json.shorts @shorts do |short|
  json.id short.id
  json.title short.title
end
json.otherShorts @other_shorts do |short|
  json.id short.id
  json.title short.title
end
