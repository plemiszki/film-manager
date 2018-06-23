var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var DigitalRetailersStore = new Store(AppDispatcher);

var _digitalRetailers = {};
var _digitalRetailerFilms = [];

DigitalRetailersStore.setDigitalRetailers = function(digitalRetailers) {
  digitalRetailers.forEach(function(digitalRetailer) {
    _digitalRetailers[digitalRetailer.id] = digitalRetailer;
  });
};

DigitalRetailersStore.setDigitalRetailerFilms = function(digitalRetailerFilms) {
  _digitalRetailerFilms = digitalRetailerFilms;
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

DigitalRetailersStore.digitalRetailerFilms = function() {
  return HandyTools.alphabetizeArrayOfObjects(_digitalRetailerFilms, 'name');
};

DigitalRetailersStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "DIGITAL_RETAILERS_RECEIVED":
      this.setDigitalRetailers(payload.digitalRetailers);
      this.__emitChange();
      break;
    case "DIGITAL_RETAILER_RECEIVED":
      this.setDigitalRetailers(payload.digitalRetailers);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.digitalRetailers && payload.digitalRetailerFilms) {
        this.setDigitalRetailers(payload.digitalRetailers);
        this.setDigitalRetailerFilms(payload.digitalRetailerFilms);
        this.__emitChange();
      }
      break;
    case "DIGITAL_RETAILER_FILMS_RECEIVED":
      this.setDigitalRetailers(payload.digitalRetailers);
      this.setDigitalRetailerFilms(payload.digitalRetailerFilms);
      this.__emitChange();
      break;
  }
};

module.exports = DigitalRetailersStore;
