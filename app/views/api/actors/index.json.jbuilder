json.actors @actors do |actor|
  json.id actor.id
  json.actorableId actor.actorable_id
  json.firstName actor.first_name
  json.lastName actor.last_name
  json.order actor.order
end
