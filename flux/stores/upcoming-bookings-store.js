var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var UpcomingBookingsStore = new Store(AppDispatcher);

var _bookings = {};

UpcomingBookingsStore.setStuff = function(payload) {
  payload.bookings.forEach(function(booking) {
    _bookings[booking.id] = booking;
  });
};

UpcomingBookingsStore.find = function(id) {
  return _bookings[id];
};

UpcomingBookingsStore.all = function() {
  var bookings = Object.keys(_bookings).map(function(id) {
    return(_bookings[id]);
  });
  return HandyTools.sortArrayOfDateStrings(bookings, 'startDate');
};

UpcomingBookingsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "UPCOMING_BOOKINGS_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = UpcomingBookingsStore;
