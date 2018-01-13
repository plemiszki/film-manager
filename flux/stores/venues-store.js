var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var VenuesStore = new Store(AppDispatcher);

var _venues = {};

VenuesStore.setVenues = function(venues) {
  venues.forEach(function(venue) {
    _venues[venue.id] = venue;
  });
};

VenuesStore.find = function(id) {
  return _venues[id];
};

VenuesStore.all = function() {
  var venues = Object.keys(_venues).map(function(id) {
    return(_venues[id]);
  });
  return Tools.alphabetizeArrayOfObjects(venues, 'label');
};

VenuesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "VENUES_RECEIVED":
      this.setVenues(payload.venues);
      this.__emitChange();
      break;
  }
};

module.exports = VenuesStore;
