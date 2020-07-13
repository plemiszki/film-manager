var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var DirectorsStore = new Store(AppDispatcher);

var _directors = {};

DirectorsStore.setDirectors = function(directors) {
  _directors = {};
  directors.forEach(function(director) {
    _directors[director.id] = director;
  });
};

DirectorsStore.find = function(id) {
  return _directors[id];
};

DirectorsStore.all = function() {
  var directors = Object.keys(_directors).map(function(id) {
    return(_directors[id]);
  });
  return HandyTools.sortArrayOfObjects(directors, 'order');
};

DirectorsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "DIRECTORS_RECEIVED":
      this.setDirectors(payload.directors);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.directors) {
        this.setDirectors(payload.directors);
        this.__emitChange();
      }
      break;
  }
};

module.exports = DirectorsStore;
