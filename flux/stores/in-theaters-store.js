var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var InTheatersStore = new Store(AppDispatcher);

var _inTheaters = [];
var _comingSoon = [];
var _repertory = [];
var _virtual = [];
var _films = [];
var _nonVirtualFilms = [];

InTheatersStore.setFilms = function(films) {
  _films = films;
};

InTheatersStore.setNonVirtualFilms = function(films) {
  _nonVirtualFilms = films;
};

InTheatersStore.setInTheaters = function(films) {
  _inTheaters = films;
};

InTheatersStore.setComingSoon = function(films) {
  _comingSoon = films;
};

InTheatersStore.setRepertory = function(films) {
  _repertory = films;
};

InTheatersStore.setVirtual = function(films) {
  _virtual = films;
};

InTheatersStore.inTheaters = function() {
  return HandyTools.sortArrayOfObjects(_inTheaters, 'order');
};

InTheatersStore.comingSoon = function() {
  return HandyTools.sortArrayOfObjects(_comingSoon, 'order');
};

InTheatersStore.repertory = function() {
  return HandyTools.sortArrayOfObjects(_repertory, 'order');
};

InTheatersStore.virtual = function() {
  return HandyTools.sortArrayOfObjects(_virtual, 'order');
};

InTheatersStore.films = function() {
  return HandyTools.alphabetizeArrayOfObjects(_films, 'title');
};

InTheatersStore.nonVirtualFilms = function() {
  return HandyTools.alphabetizeArrayOfObjects(_nonVirtualFilms, 'title');
};

InTheatersStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "IN_THEATERS_RECEIVED":
      this.setFilms(payload.films);
      this.setNonVirtualFilms(payload.nonVirtualFilms);
      this.setInTheaters(payload.inTheaters);
      this.setComingSoon(payload.comingSoon);
      this.setRepertory(payload.repertory);
      this.setVirtual(payload.virtual);
      this.__emitChange();
      break;
  }
};

module.exports = InTheatersStore;
