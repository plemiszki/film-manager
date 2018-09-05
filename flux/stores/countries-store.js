var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var CountriesStore = new Store(AppDispatcher);

var _countries = {};
var _filmCountries = {};

CountriesStore.setCountries = function(countries) {
  _countries = {};
  countries.forEach(function(country) {
    _countries[country.id] = country;
  });
};

CountriesStore.setFilmCountries = function(filmCountries) {
  _filmCountries = {};
  filmCountries.forEach(function(filmCountry) {
    _filmCountries[filmCountry.id] = filmCountry;
  });
};

CountriesStore.find = function(id) {
  return _countries[id];
};

CountriesStore.all = function() {
  var countries = Object.keys(_countries).map(function(id) {
    return(_countries[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(countries, 'name');
};

CountriesStore.filmCountries = function() {
  var filmCountries = Object.keys(_filmCountries).map(function(id) {
    return(_filmCountries[id]);
  });
  return HandyTools.sortArrayOfObjects(filmCountries, 'order');
};

CountriesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "COUNTRIES_RECEIVED":
      this.setCountries(payload.countries);
      this.__emitChange();
      break;
    case "FILM_COUNTRIES_RECEIVED":
      this.setCountries(payload.countries);
      this.setFilmCountries(payload.filmCountries);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.countries && payload.filmCountries) {
        this.setCountries(payload.countries);
        this.setFilmCountries(payload.filmCountries);
        this.__emitChange();
      }
      break;
  }
};

module.exports = CountriesStore;
