json.array! @giftboxes do |giftbox|
  json.id giftbox.id
  json.name giftbox.name
  json.type giftbox.on_demand ? "Assemble on Demand" : "Prepackaged"
  json.quantity giftbox.on_demand ? "" : giftbox.quantity
end
