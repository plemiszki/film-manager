var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var ActorsStore = new Store(AppDispatcher);

var _actors = {};

ActorsStore.setActors = function(actors) {
  _actors = {};
  actors.forEach(function(actor) {
    _actors[actor.id] = actor;
  });
};

ActorsStore.find = function(id) {
  return _actors[id];
};

ActorsStore.all = function() {
  var actors = Object.keys(_actors).map(function(id) {
    return(_actors[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(actors, 'lastName');
};

ActorsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "ACTORS_RECEIVED":
      this.setActors(payload.actors);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.actors) {
        this.setActors(payload.actors);
        this.__emitChange();
      }
      break;
  }
};

module.exports = ActorsStore;
