var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var BookersStore = new Store(AppDispatcher);

var _bookers = {};

BookersStore.setBookers = function(bookers) {
  _bookers = {};
  bookers.forEach(function(booker) {
    _bookers[booker.id] = booker;
  });
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

BookersStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "BOOKERS_RECEIVED":
      this.setBookers(payload.bookers);
      this.__emitChange();
      break;
  }
};

module.exports = BookersStore;
