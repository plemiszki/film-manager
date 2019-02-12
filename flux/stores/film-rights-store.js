var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FilmRightsStore = new Store(AppDispatcher);

var _filmRight = {};
var _rights = [];
var _territores = [];
var _films = [];

FilmRightsStore.setFilmRight = function(filmRights) {
  _filmRight = filmRight;
};

FilmRightsStore.setTerritories = function(territories) {
  _territores = territories;
};

FilmRightsStore.setRights = function(rights) {
  _rights = rights;
};

FilmRightsStore.setFilms = function(films) {
  _films = films;
};

FilmRightsStore.filmRight = function(id) {
  return _filmRight;
};

FilmRightsStore.territories = function(id) {
  return HandyTools.alphabetizeArrayOfObjects(_territores, 'name');
};

FilmRightsStore.rights = function(id) {
  return HandyTools.alphabetizeArrayOfObjects(_rights, 'name');
};

FilmRightsStore.films = function(id) {
  return HandyTools.alphabetizeArrayOfObjects(_films, 'title');
};

FilmRightsStore.filmRights = function() {
  var filmRights = Object.keys(_filmRights).map(function(id) {
    return(_filmRights[id]);
  });
  return HandyTools.sortArrayOfObjects(filmRights, 'order');
};

FilmRightsStore.__onDispatch = function(payload) {
  switch(payload.actionType) {
    case 'FILM_RIGHT_RECEIVED':
      if (payload.filmRights) {
        this.setFilmRight(payload.filmRights[0]);
      }
      this.setTerritories(payload.territories);
      this.setRights(payload.rights);
      if (payload.films) {
        this.setFilms(payload.films);
      }
      this.__emitChange();
  }
};

module.exports = FilmRightsStore;
