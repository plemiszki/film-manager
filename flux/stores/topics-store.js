var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var TopicsStore = new Store(AppDispatcher);

var _topics = {};
var _filmTopics = {};

TopicsStore.setTopics = function(topics) {
  _topics = {};
  topics.forEach(function(topic) {
    _topics[topic.id] = topic;
  });
};

TopicsStore.setFilmTopics = function(filmTopics) {
  _filmTopics = {};
  filmTopics.forEach(function(filmTopic) {
    _filmTopics[filmTopic.id] = filmTopic;
  });
};

TopicsStore.find = function(id) {
  return _topics[id];
};

TopicsStore.all = function() {
  var topics = Object.keys(_topics).map(function(id) {
    return(_topics[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(topics, 'name');
};

TopicsStore.filmTopics = function() {
  var filmTopics = Object.keys(_filmTopics).map(function(id) {
    return(_filmTopics[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(filmTopics, 'topic');
};

TopicsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "TOPICS_RECEIVED":
      this.setTopics(payload.topics);
      this.__emitChange();
      break;
    case "FILM_TOPICS_RECEIVED":
      this.setTopics(payload.topics);
      this.setFilmTopics(payload.filmTopics);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.topics && payload.filmTopics) {
        this.setTopics(payload.topics);
        this.setFilmTopics(payload.filmTopics);
        this.__emitChange();
      }
      break;
  }
};

module.exports = TopicsStore;
