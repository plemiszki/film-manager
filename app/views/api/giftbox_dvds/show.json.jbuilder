json.giftboxDvds @giftbox_dvds do |giftbox_dvd|
  json.id giftbox_dvd.id
  json.dvdId giftbox_dvd.dvd.id
  json.title giftbox_dvd.dvd.feature.title
end
json.otherDvds @other_dvds do |dvd|
  json.id dvd.id
  json.title "#{dvd.feature.title} - #{dvd.dvd_type.name}"
end
