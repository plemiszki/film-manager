var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var DigitalRetailersStore = new Store(AppDispatcher);

var _digitalRetailers = {};
var _films = [];
var _otherFilms = [];

DigitalRetailersStore.setDigitalRetailers = function(digitalRetailers) {
  digitalRetailers.forEach(function(giftbox) {
    _digitalRetailers[giftbox.id] = giftbox;
  });
};

DigitalRetailersStore.setFilms = function(films) {
  _films = films;
};

DigitalRetailersStore.setOtherFilms = function(otherFilms) {
  _otherFilms = otherFilms;
};

DigitalRetailersStore.find = function(id) {
  return _digitalRetailers[id];
};

DigitalRetailersStore.all = function() {
  var digitalRetailers = Object.keys(_digitalRetailers).map(function(id) {
    return(_digitalRetailers[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(digitalRetailers, 'name');
};

DigitalRetailersStore.films = function() {
  return HandyTools.alphabetizeArrayOfObjects(_films, 'title');
};

DigitalRetailersStore.otherFilms = function() {
  return HandyTools.alphabetizeArrayOfObjects(_otherFilms, 'title');
};

DigitalRetailersStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "DIGITAL_RETAILERS_RECEIVED":
      this.setDigitalRetailers(payload.digitalRetailers);
      this.__emitChange();
      break;
    case "DIGITAL_RETAILER_RECEIVED":
      this.setDigitalRetailers(payload.digitalRetailers);
      this.setFilms(payload.films);
      this.setOtherFilms(payload.otherFilms);
      this.__emitChange();
      break;
  }
};

module.exports = DigitalRetailersStore;
