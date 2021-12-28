json.giftbox do
  json.id @giftbox.id
  json.name @giftbox.name
  json.upc @giftbox.upc
  json.sageId @giftbox.sage_id
  json.msrp dollarify(number_with_precision(@giftbox.msrp, precision: 2, delimiter: ','))
  json.onDemand @giftbox.on_demand
  json.quantity @giftbox.quantity.to_s
end
json.giftboxDvds @giftbox_dvds do |giftbox_dvd|
  json.id giftbox_dvd.id
  json.dvdId giftbox_dvd.dvd.id
  json.title giftbox_dvd.dvd.feature.title
end
json.otherDvds @other_dvds do |dvd|
  json.id dvd.id
  json.title "#{dvd.feature.title} - #{dvd.dvd_type.name}"
end
