var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var CountriesStore = new Store(AppDispatcher);

var _countries = {};

CountriesStore.setCountries = function(countries) {
  countries.forEach(function(country) {
    _countries[country.id] = country;
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

CountriesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "COUNTRIES_RECEIVED":
      this.setCountries(payload.countries);
      this.__emitChange();
      break;
  }
};

module.exports = CountriesStore;
