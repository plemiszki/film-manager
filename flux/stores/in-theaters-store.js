var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var InTheatersStore = new Store(AppDispatcher);

var _inTheaters = [];
var _comingSoon = [];
var _films = [];

InTheatersStore.setFilms = function(films) {
  _films = films;
};

InTheatersStore.setInTheaters = function(films) {
  _inTheaters = films;
};

InTheatersStore.setComingSoon = function(films) {
  console.log(films);
  _comingSoon = films;
};

InTheatersStore.inTheaters = function() {
  return HandyTools.sortArrayOfObjects(_inTheaters, 'order');
};

InTheatersStore.comingSoon = function() {
  return HandyTools.sortArrayOfObjects(_comingSoon, 'order');
};

InTheatersStore.films = function() {
  return HandyTools.alphabetizeArrayOfObjects(_films, 'title');
};

InTheatersStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "IN_THEATERS_RECEIVED":
      this.setFilms(payload.films);
      this.setInTheaters(payload.inTheaters);
      this.setComingSoon(payload.comingSoon);
      this.__emitChange();
      break;
  }
};

module.exports = InTheatersStore;
