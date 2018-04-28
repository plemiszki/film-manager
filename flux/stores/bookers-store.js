var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var BookersStore = new Store(AppDispatcher);

var _bookers = {};
var _bookerVenues = [];
var _venues = [];

BookersStore.setBookers = function(bookers) {
  _bookers = {};
  bookers.forEach(function(booker) {
    _bookers[booker.id] = booker;
  });
};

BookersStore.setBookerVenues = function(bookerVenues) {
  _bookerVenues = bookerVenues;
};

BookersStore.setVenues = function(venues) {
  _venues = venues;
};

BookersStore.find = function(id) {
  return _bookers[id];
};

BookersStore.all = function() {
  var bookers = Object.keys(_bookers).map(function(id) {
    return(_bookers[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(bookers, 'name');
};

BookersStore.bookerVenues = function(id) {
  return HandyTools.alphabetizeArrayOfObjects(_bookerVenues, 'venue');
};

BookersStore.venues = function(id) {
  return HandyTools.alphabetizeArrayOfObjects(_venues, 'name');
};

BookersStore.__onDispatch = function(payload) {
  switch(payload.actionType) {
    case "BOOKERS_RECEIVED":
      this.setBookers(payload.bookers);
      this.setBookerVenues(payload.bookerVenues);
      this.setVenues(payload.venues);
      this.__emitChange();
      break;
  }
};

module.exports = BookersStore;
