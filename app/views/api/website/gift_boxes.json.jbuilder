json.array!(@gift_boxes) do |giftbox|
  json.id giftbox.id
  json.name giftbox.name
  json.upc giftbox.upc
  json.msrp dollarify(giftbox.msrp.to_s)
  json.on_demand giftbox.on_demand
  json.stock giftbox.quantity
  json.dvds giftbox.dvds do |dvd|
    json.id dvd.id
    json.dvd_type dvd.dvd_type.name
    json.feature_film_id dvd.feature_film_id
    json.price dollarify(dvd.price.to_s)
    json.upc dvd.upc
    json.sound_config dvd.sound_config
    json.special_features dvd.special_features
    json.retail_date dvd.retail_date
    json.stock dvd.stock
    json.shorts dvd.dvd_shorts do |dvd_short|
      json.id dvd_short.id
      json.short_id dvd_short.short_id
    end
  end
end
