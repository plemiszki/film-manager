var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var EpisodesStore = new Store(AppDispatcher);

var _episode = {};

EpisodesStore.setEpisode = function(episode) {
  _episode = episode;
};

EpisodesStore.episode = function() {
  return _episode;
};

EpisodesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "EPISODE_RECEIVED":
      this.setEpisode(payload.episode);
      this.__emitChange();
      break;
  }
};

module.exports = EpisodesStore;
