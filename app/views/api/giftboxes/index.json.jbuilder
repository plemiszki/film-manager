json.giftboxes @giftboxes do |giftbox|
  json.id giftbox.id
  json.name giftbox.name
  json.quantity giftbox.on_demand ? "" : giftbox.quantity
end
