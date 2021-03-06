var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var BookingsStore = new Store(AppDispatcher);

var _bookings = {};
var _invoices = {};
var _films = {};
var _venues = {};
var _users = {};
var _formats = {};
var _weeklyTerms = {};
var _weeklyBoxOffice = {};
var _payments = {};

BookingsStore.setStuff = function(payload) {
  payload.bookings.forEach(function(booking) {
    _bookings[booking.id] = booking;
  });
  if (payload.invoices) {
    payload.invoices.forEach(function(invoice) {
      _invoices[invoice.id] = invoice;
    });
  }
  if (payload.films) {
    payload.films.forEach(function(film) {
      _films[film.id] = film;
    });
  }
  if (payload.venues) {
    payload.venues.forEach(function(venue) {
      _venues[venue.id] = venue;
    });
  }
  if (payload.weeklyTerms) {
    payload.weeklyTerms.forEach(function(weeklyTerm) {
      _weeklyTerms[weeklyTerm.id] = weeklyTerm;
    });
  }
  if (payload.weeklyBoxOffice) {
    payload.weeklyBoxOffice.forEach(function(weeklyBoxOffice) {
      _weeklyBoxOffice[weeklyBoxOffice.id] = weeklyBoxOffice;
    });
  }
  if (payload.payments) {
    payload.payments.forEach(function(payment) {
      _payments[payment.id] = payment;
    });
  }
  if (payload.users) {
    payload.users.forEach(function(user) {
      _users[user.id] = user;
    });
  }
  if (payload.formats) {
    payload.formats.forEach(function(format) {
      _formats[format.id] = format;
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

BookingsStore.invoices = function() {
  var invoices = Object.keys(_invoices).map(function(id) {
    return(_invoices[id]);
  });
  return HandyTools.sortArrayOfDateStrings(invoices, 'sentDate');
};

BookingsStore.findInvoice = function(id) {
  return _invoices[id];
};

BookingsStore.formats = function() {
  var formats = Object.keys(_formats).map(function(id) {
    return(_formats[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(formats, 'name');
};

BookingsStore.activeFormats = function() {
  var formats = Object.keys(_formats).map(function(id) {
    return(_formats[id]);
  });
  formats = formats.filter((format) => {
    console.log(format);
    return format.active === true;
  });
  return HandyTools.alphabetizeArrayOfObjects(formats, 'name');
};

BookingsStore.bookers = function() {
  var users = Object.keys(_users).map(function(id) {
    return(_users[id]);
  });
  users = users.filter(function(user) { return user.booker });
  return HandyTools.alphabetizeArrayOfObjects(users, 'name');
};

BookingsStore.activeBookers = function() {
  var users = Object.keys(_users).map(function(id) {
    return(_users[id]);
  });
  users = users.filter(function(user) { return user.booker && user.inactive === false });
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
  return HandyTools.sortArrayOfObjects(weeklyTerms, 'order');
};

BookingsStore.weeklyBoxOffice = function() {
  var weeklyBoxOffice = Object.keys(_weeklyBoxOffice).map(function(id) {
    return(_weeklyBoxOffice[id]);
  });
  return HandyTools.sortArrayOfObjects(weeklyBoxOffice, 'order');
};

BookingsStore.payments = function() {
  var payments = Object.keys(_payments).map(function(id) {
    return(_payments[id]);
  });
  return HandyTools.sortArrayOfDateStrings(payments, 'date');
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
