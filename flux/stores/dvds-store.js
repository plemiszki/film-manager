var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var DvdsStore = new Store(AppDispatcher);

var _dvds = {};
var _types = [];

DvdsStore.setDvds = function (dvds) {
  dvds.forEach(function(dvd) {
    _dvds[dvd.id] = dvd;
  });
};

DvdsStore.setTypes = function(types) {
  _types = types;
};

DvdsStore.find = function (id) {
  return _dvds[id];
};

DvdsStore.all = function() {
  var dvds = Object.keys(_dvds).map(function (id) {
    return(_dvds[id]);
  });
  return Tools.alphabetizeArrayOfObjects(dvds, 'name');
};

DvdsStore.types = function() {
  return _types;
};

DvdsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "DVDS_RECEIVED":
      this.setDvds(payload.dvds);
      this.setTypes(payload.dvdTypes);
      this.__emitChange();
      break;
  }
};

module.exports = DvdsStore;
