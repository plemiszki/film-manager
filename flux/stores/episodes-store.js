var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var EpisodesStore = new Store(AppDispatcher);

var _episode = {};
var _actors = [];

EpisodesStore.setStuff = function(episode, actors) {
  _episode = episode;
  _actors = actors;
};

EpisodesStore.episode = function() {
  return _episode;
};

EpisodesStore.actors = function() {
  return HandyTools.sortArrayOfObjects(_actors, 'order');
};

EpisodesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "EPISODE_RECEIVED":
      this.setStuff(payload.episode, payload.actors);
      this.__emitChange();
      break;
  }
};

module.exports = EpisodesStore;
