json.giftboxes @giftboxes do |giftbox|
  json.id giftbox.id
  json.name giftbox.name
  json.upc giftbox.upc
  json.sageId giftbox.sage_id
  json.msrp dollarify(number_with_precision(giftbox.msrp, precision: 2, delimiter: ','))
  json.onDemand giftbox.on_demand == true ? "yes" : "no"
  json.quantity giftbox.quantity
end
json.dvds @dvds do |dvd|
  json.id dvd.id
  json.title dvd.feature.title
end
