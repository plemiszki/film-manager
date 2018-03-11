var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var TopicsStore = new Store(AppDispatcher);

var _topics = {};

TopicsStore.setTopics = function(topics) {
  topics.forEach(function(topic) {
    _topics[topic.id] = topic;
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

TopicsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "TOPICS_RECEIVED":
      this.setTopics(payload.topics);
      this.__emitChange();
      break;
  }
};

module.exports = TopicsStore;
