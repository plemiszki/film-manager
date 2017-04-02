var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FilmsStore = new Store(AppDispatcher);

var _films = {};
var _dealTemplates = [];
var _licensors = {};

FilmsStore.setFilms = function(films) {
  films.forEach(function(film) {
    _films[film.id] = film;
  });
};

FilmsStore.setDealTemplates = function(dealTemplates) {
  _dealTemplates = dealTemplates;
};

FilmsStore.setLicensors = function(licensors) {
  licensors.forEach(function(licensor) {
    _licensors[licensor.id] = licensor;
  });
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

FilmsStore.licensors = function() {
  var licensors = Object.keys(_licensors).map(function(id) {
    return(_licensors[id]);
  });
  return Tools.alphabetizeArrayOfObjects(licensors, 'name');
};

FilmsStore.findLicensor = function(id) {
  return _licensors[id];
};

FilmsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "FILMS_RECEIVED":
      this.setFilms(payload.films);
      if (payload.dealTemplates) {
        this.setDealTemplates(payload.dealTemplates);
        this.setLicensors(payload.licensors);
      }
      this.__emitChange();
      break;
  }
};

module.exports = FilmsStore;
