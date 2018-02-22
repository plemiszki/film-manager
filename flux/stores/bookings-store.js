var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var BookingsStore = new Store(AppDispatcher);

var _bookings = {};
var _films = {};
var _venues = {};
var _users = {};
var _weeklyTerms = {};

BookingsStore.setStuff = function(payload) {
  payload.bookings.forEach(function(booking) {
    _bookings[booking.id] = booking;
  });
  payload.films.forEach(function(film) {
    _films[film.id] = film;
  });
  payload.venues.forEach(function(venue) {
    _venues[venue.id] = venue;
  });
  if (payload.weeklyTerms) {
    payload.weeklyTerms.forEach(function(weeklyTerm) {
      _weeklyTerms[weeklyTerm.id] = weeklyTerm;
    });
  }
  if (payload.users) {
    payload.users.forEach(function(user) {
      _users[user.id] = user;
    });
  }
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

BookingsStore.users = function() {
  var users = Object.keys(_users).map(function(id) {
    return(_users[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(users, 'name');
};

BookingsStore.bookers = function() {
  var users = Object.keys(_users).map(function(id) {
    return(_users[id]);
  });
  users = users.filter(function(user) { return user.booker });
  return HandyTools.alphabetizeArrayOfObjects(users, 'name');
};

BookingsStore.films = function() {
  var films = Object.keys(_films).map(function(id) {
    return(_films[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(films, 'title');
};

BookingsStore.findFilm = function(id) {
  return _films[id];
};

BookingsStore.venues = function() {
  var venues = Object.keys(_venues).map(function(id) {
    return(_venues[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(venues, 'label');
};

BookingsStore.findVenue = function(id) {
  return _venues[id];
};

BookingsStore.weeklyTerms = function() {
  var weeklyTerms = Object.keys(_weeklyTerms).map(function(id) {
    return(_weeklyTerms[id]);
  });
  return HandyTools.sortArrayOfObjects(weeklyTerms, 'week');
};

BookingsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "BOOKINGS_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = BookingsStore;
