json.filmTopics @film_topics do |film_topic|
  json.id film_topic.id
  json.topic film_topic.topic.name
end
json.topics @topics do |topic|
  json.id topic.id
  json.name topic.name
end
