var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FilmRightsStore2 = new Store(AppDispatcher);

var _filmRights = [];

FilmRightsStore2.setFilmRights = function(filmRights) {
  _filmRights = filmRights;
};

FilmRightsStore2.filmRights = function() {
  return _filmRights;
};

FilmRightsStore2.__onDispatch = function(payload) {
  switch (payload.actionType) {
    case 'FILM_RIGHTS_RECEIVED':
      this.setFilmRights(payload.filmRights);
      this.__emitChange();
  }
};

module.exports = FilmRightsStore2;
