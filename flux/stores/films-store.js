var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FilmsStore = new Store(AppDispatcher);

var _films = {};

FilmsStore.setFilms = function (films) {
  films.forEach(function(film) {
    _films[film.id] = film;
  });
};

FilmsStore.find = function (id) {
  return _films[id];
};

FilmsStore.all = function() {
  var films = Object.keys(_films).map(function(id) {
    return(_films[id]);
  });
  return Tools.alphabetizeArrayOfObjects(films, 'title');
};

FilmsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "FILMS_RECEIVED":
      this.setFilms(payload.films);
      this.__emitChange();
      break;
  }
};

module.exports = FilmsStore;
