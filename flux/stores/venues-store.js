var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var VenuesStore = new Store(AppDispatcher);

var _venues = {};
var _bookings = [];

VenuesStore.setVenues = function(venues) {
  venues.forEach(function(venue) {
    _venues[venue.id] = venue;
  });
};

VenuesStore.setBookings = function(bookings) {
  _bookings = bookings;
};

VenuesStore.find = function(id) {
  return _venues[id];
};

VenuesStore.all = function() {
  var venues = Object.keys(_venues).map(function(id) {
    return(_venues[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(venues, 'label');
};

VenuesStore.bookings = function() {
  return HandyTools.sortArrayOfDateStrings(_bookings, 'startDate').reverse();
};

VenuesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "VENUES_RECEIVED":
      this.setVenues(payload.venues);
      if (payload.bookings) {
        this.setBookings(payload.bookings);
      }
      this.__emitChange();
      break;
  }
};

module.exports = VenuesStore;
