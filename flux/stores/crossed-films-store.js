var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var CrossedFilmsStore = new Store(AppDispatcher);

var _crossedFilms = {};
var _otherCrossedFilms = [];

CrossedFilmsStore.setCrossedFilms = function(crossedFilms) {
  _crossedFilms = {};
  crossedFilms.forEach(function(crossedFilm) {
    _crossedFilms[crossedFilm.id] = crossedFilm;
  });
};

CrossedFilmsStore.setOtherCrossedFilms = function(otherCrossedFilms) {
  _otherCrossedFilms = otherCrossedFilms;
};

CrossedFilmsStore.all = function() {
  var crossedFilms = Object.keys(_crossedFilms).map(function(id) {
    return(_crossedFilms[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(crossedFilms, 'title');
};

CrossedFilmsStore.otherCrossedFilms = function() {
  return HandyTools.alphabetizeArrayOfObjects(_otherCrossedFilms, 'title');
};

CrossedFilmsStore.__onDispatch = function(payload) {
  switch(payload.actionType) {
    case "CROSSED_FILMS_RECEIVED":
      this.setCrossedFilms(payload.crossedFilms);
      this.setOtherCrossedFilms(payload.otherCrossedFilms);
      this.__emitChange();
      break;
  }
};

module.exports = CrossedFilmsStore;
