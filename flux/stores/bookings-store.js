var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var BookingsStore = new Store(AppDispatcher);

var _bookings = {};

BookingsStore.setStuff = function(payload) {
  console.log(payload);
  payload.bookings.forEach(function(booking) {
    _bookings[booking.id] = booking;
  });
};

BookingsStore.find = function(id) {
  return _bookings[id];
};

BookingsStore.all = function() {
  var bookings = Object.keys(_bookings).map(function(id) {
    return(_bookings[id]);
  });
  return HandyTools.sortArrayOfDateStrings(bookings, 'startDate');
};

BookingsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "BOOKINGS_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
    case "BOOKINGS_RECEIVED":
      this.setGiftboxes(payload.bookings);
      this.setDvds(payload.dvds);
      this.setOtherDvds(payload.otherDvds);
      this.__emitChange();
      break;
  }
};

module.exports = BookingsStore;
