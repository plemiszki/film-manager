var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FilmsStore = new Store(AppDispatcher);

var _films = {};
var _dealTemplates = [];

FilmsStore.setFilms = function(films) {
  films.forEach(function(film) {
    _films[film.id] = film;
  });
};

FilmsStore.setDealTemplates = function(dealTemplates) {
  _dealTemplates = dealTemplates;
};

FilmsStore.find = function(id) {
  return _films[id];
};

FilmsStore.all = function() {
  var films = Object.keys(_films).map(function(id) {
    return(_films[id]);
  });
  return Tools.alphabetizeArrayOfObjects(films, 'title');
};

FilmsStore.dealTemplates = function() {
  return _dealTemplates;
};

FilmsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "FILMS_RECEIVED":
      this.setFilms(payload.films);
      if (payload.dealTemplates) {
        this.setDealTemplates(payload.dealTemplates)
      }
      this.__emitChange();
      break;
  }
};

module.exports = FilmsStore;
