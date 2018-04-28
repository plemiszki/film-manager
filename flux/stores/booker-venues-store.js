var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var BookerVenuesStore = new Store(AppDispatcher);

var _bookerVenues = [];
var _venues = [];

BookerVenuesStore.setVenues = function(venues) {
  _venues = venues
};

BookerVenuesStore.setBookerVenues = function(bookerVenues) {
  _bookerVenues = {};
  bookerVenues.forEach(function(bookerCountry) {
    _bookerVenues[bookerCountry.id] = bookerCountry;
  });
};

BookerVenuesStore.venues = function() {
  return HandyTools.alphabetizeArrayOfObjects(_venues, 'name');
};

BookerVenuesStore.all = function() {
  var bookerVenues = Object.keys(_bookerVenues).map(function(id) {
    return(_bookerVenues[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(bookerVenues, 'venue');
};

BookerVenuesStore.__onDispatch = function(payload) {
  switch(payload.actionType) {
    case "BOOKER_VENUES_RECEIVED":
      this.setVenues(payload.venues);
      this.setBookerVenues(payload.bookerVenues);
      this.__emitChange();
      break;
  }
};

module.exports = BookerVenuesStore;
